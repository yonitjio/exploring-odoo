# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import logging
import json

from odoo import tools

from autogen_core import Image, CancellationToken, TRACE_LOGGER_NAME, EVENT_LOGGER_NAME
from autogen_agentchat.base import TaskResult
from autogen_agentchat.messages import MultiModalMessage, TextMessage
from autogen_agentchat.agents import AssistantAgent

from autogen_ext.tools.mcp import McpWorkbench

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from .utils import process_template, run_async_function

import markdown
from markupsafe import Markup

from .tools import get_chat_completion_client_node, get_tool_nodes, get_mcp_node
from odoo.addons.nuido_flow.flows.tools.tools import get_default_context_for_eval

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

autogen_logger = logging.getLogger(TRACE_LOGGER_NAME)
autogen_logger.setLevel(logging.ERROR)
autogen_logger = logging.getLogger(EVENT_LOGGER_NAME)
autogen_logger.setLevel(logging.ERROR)

class AssistantAgentNode(BaseNode):
    def __init__(self, environment, create_function_registry, definitions, definition) -> None:
        super().__init__(environment, create_function_registry, definitions, definition)

        kwargs = self._setup_assistant_agent()

        self.agent = AssistantAgent(**kwargs)

    def _setup_assistant_agent(self):
        completion_node = get_chat_completion_client_node(self)

        self.model_client = completion_node.process({
                "is_structured": self.definition["is_structured"],
                "schema": self.definition["schema"]
            })["client"]

        self.tool_nodes = get_tool_nodes(self)
        self.tools = []
        for tn in self.tool_nodes:
            tools = tn.process({})
            self.tools.extend(tools["tools"])

        self.workbench = None
        self.mcp_server = None
        self.mcp_node = get_mcp_node(self)
        if self.mcp_node is not None:
            self.mcp_server = self.mcp_node.process({})["mcp_server"]
            self.workbench = McpWorkbench(self.mcp_server)

        return {
            'name': "assistant_agent",
            'model_client': self.model_client,
            'system_message': self.definition["system_message"],
            'tools': self.tools,
            'reflect_on_tool_use': self.definition["is_reflect_on_tool_use"],
            'workbench': self.workbench,
        }

    def _create_task(self, prompt):
        task = None
        if isinstance(prompt, str):
            task = [TextMessage(content=prompt, source="user")]
        elif isinstance(prompt, dict):
            text = prompt["text"]
            if "image" in prompt and prompt["image"] is not None:
                base64_image = prompt["image"]
                image = Image.from_base64(base64_image)
                task = [MultiModalMessage(content=[text, image], source="user")]
            else:
                task = [TextMessage(content=text, source="user")]
        return task

    async def _do_ask_ai(self, prompt):
        task = self._create_task(prompt)

        if task is not None:
            response = await self.agent.run(task=task, cancellation_token=CancellationToken())
            return response

        raise Exception("Unable to create task for AI agent.")

    async def _ask_ai(self, params):
        response = TaskResult(messages=[], stop_reason="None")
        try:
            context = get_default_context_for_eval(self.env)

            variables = {}
            variables.update(**context)
            variables.update(**params)
            prompt_def = process_template(self.definition["prompt"], variables)

            try:
                prompt = json.loads(prompt_def)
            except:
                _logger.debug(f"Unable to load prompt as json, it will be treated as regular string: {prompt_def}")
                prompt = prompt_def

            if self.workbench is not None:
                await self.workbench.start()

            response = await self._do_ask_ai(prompt)
        except:
            _logger.error("Error processing message.", exc_info=True)
            response = TaskResult(messages=[], stop_reason="Error asking AI.")
        finally:
            await self.model_client.close()
            if self.workbench is not None:
                await self.workbench.stop()

        return response

    def _process(self, params):
        super()._process(params)

        res = run_async_function(self._ask_ai, params)
        result = ""

        message_length = len(res.messages)
        if message_length > 0:
            result = res.messages[len(res.messages) - 1].content

        if self.definition["is_html_result"]:
            result = Markup(tools.html_sanitize(markdown.markdown(result, extensions=['fenced_code', 'sane_lists'])))
        elif self.definition["is_structured"]:
            result = json.loads(result)

        return {
                "result": result
            }
