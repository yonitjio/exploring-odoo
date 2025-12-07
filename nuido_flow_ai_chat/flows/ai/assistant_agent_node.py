# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import logging
import json

from autogen_core import CancellationToken, TRACE_LOGGER_NAME, EVENT_LOGGER_NAME

from autogen_agentchat.base import TaskResult
from autogen_agentchat.messages import ModelClientStreamingChunkEvent, ToolCallSummaryMessage

from odoo.addons.nuido_flow_ai.flows.ai.assistant_agent_node import AssistantAgentNode as AANode

from .tools import get_chat_responder_node

autogen_logger = logging.getLogger(TRACE_LOGGER_NAME)
autogen_logger.setLevel(logging.ERROR)
autogen_logger = logging.getLogger(EVENT_LOGGER_NAME)
autogen_logger.setLevel(logging.ERROR)

class AssistantAgentNode(AANode):
    def _setup_assistant_agent(self):
        context = self.env.context

        self.responder_node = get_chat_responder_node(self)

        self.chat_mode = None
        if "run_params" in context and "chat_mode" in context["run_params"]:
            self.chat_mode = context["run_params"]["chat_mode"]

        self.chat_state = None
        self.is_stateful = self.definition["is_stateful"]
        self.is_streaming = self.definition["is_streaming"]

        node_def_id = context["active_node_definition_id"]

        chat_state_count = self.env["nuido_flow_ai_chat.chat.state"].search_count([
            ("user_id", "=", context["uid"]),
            ("node_def_id", "=", node_def_id),
            ("node_id", "=", self.id)
        ])

        if self.definition["is_stateful"]:
            if chat_state_count == 0:
                self.env["nuido_flow_ai_chat.chat.state"].create({
                    "user_id": context["uid"],
                    "node_def_id": node_def_id,
                    "node_id": self.id,
                    "test_chat_state": "",
                    "chat_state": ""
                })
        else:
            if chat_state_count > 0:
                recs = self.env["nuido_flow_ai_chat.chat.state"].search([
                    ("user_id", "=", context["uid"]),
                    ("node_def_id", "=", node_def_id),
                    ("node_id", "=", self.id)
                ])
                for rec in recs:
                    rec.unlink()

        parent_kwargs = super()._setup_assistant_agent()
        return {
            **parent_kwargs,
            'model_client_stream': self.is_streaming,
        }

    async def _load_chat_state(self, context):
        if self.is_stateful and self.chat_mode is not None:
            user = context["user"]
            node_def_id = context["active_node_definition_id"]

            self.chat_state = user.nuido_flow_ai_chat_states.search([
                ("user_id", "=", context["uid"]),
                ("node_def_id", "=", node_def_id),
                ("node_id", "=", self.id)
            ])[0]

            if (self.chat_mode == "test"):
                if self.chat_state["test_chat_state"] != "":
                    saved_state = json.loads(self.chat_state["test_chat_state"])
                    await self.agent.load_state(saved_state)
            else:
                if self.chat_state["chat_state"] != "":
                    saved_state = json.loads(self.chat_state["chat_state"])
                    await self.agent.load_state(saved_state)

    async def _save_chat_state(self):
        if self.is_stateful and self.chat_mode is not None and self.chat_state is not None:
            agent_state = await self.agent.save_state()
            jsonState = json.dumps(agent_state)
            if (self.chat_mode == "test"):
                self.chat_state["test_chat_state"] = jsonState
            else:
                self.chat_state["chat_state"] = jsonState

    async def _do_ask_ai(self, prompt):
        context = self.env.context
        response = TaskResult(messages=[], stop_reason="None")

        await self._load_chat_state(context)

        task = self._create_task(prompt)

        if task is not None:
            if self.is_streaming and self.responder_node is not None and self.chat_mode is not None:
                async for message in self.agent.run_stream(task=task, cancellation_token=CancellationToken()):

                    if isinstance(message, (TaskResult)):
                        if isinstance(message.messages[len(message.messages) - 1], (ToolCallSummaryMessage)):
                            responseText = message.messages[len(message.messages) - 1].content
                            self.responder_node.process({ "message": { "text": responseText }, "stop": False })

                        self.responder_node.process({ "message": {}, "stop": True })

                        response = message
                    elif isinstance(message, (ModelClientStreamingChunkEvent)) and message.source != "user":
                        responseText = message.content
                        self.responder_node.process({ "message": { "text": responseText }, "stop": False })
            else:
                response = await self.agent.run(task=task, cancellation_token=CancellationToken())
                responseText = response.messages[len(response.messages) - 1].content

                if self.responder_node is not None and self.chat_mode is not None:
                    self.responder_node.process({ "message": { "text": responseText }, "stop": False })
                    self.responder_node.process({ "message": {}, "stop": True })

            await self._save_chat_state()
        else:
            raise Exception("Unable to create task for AI.")

        return response
