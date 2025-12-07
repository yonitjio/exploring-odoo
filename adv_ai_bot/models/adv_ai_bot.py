# -*- coding: utf-8 -*-

import logging

_logger = logging.getLogger(__name__)

import json
from datetime import datetime
from textwrap import dedent
from typing import Dict #, Any # Include Any when using SilentConsole

from autogen import (
    AssistantAgent,
    Agent,
    UserProxyAgent,
    GroupChat
)

from autogen.coding import MarkdownCodeExtractor
# from autogen.io import console, base

from .agents.consts import DEFAULT_AUTOGEN_LLM_CONFIG, KB_TOPICS
from .agents import (
    ResumingGroupChatManager,
    GroupChatWithMessageCallback,
    UserProxyAgentForSql,
    ConversationAnalystAgent
)

# class SilentConsole(console.IOConsole):
#     def print(self, *objects: Any, sep: str = " ", end: str = "\n", flush: bool = False) -> None:
#         pass

# base.IOStream.set_global_default(SilentConsole())
# base.IOStream.set_default(SilentConsole())


class AdvAiBot:
    RECEPTIONIST_SYSTEM_MESSAGE = f"""
    You are the receptionist for the IT team.

    Your task is to act as a bridge between user and the IT team.

    If the user give tasks or questions related to any of these topic {KB_TOPICS}, forward the tasks to the IT team.
    No need to confirm it to the user.

    To forward the tasks, reply exactly with this text:
    "Forwarding user to: IT team"

    In this case, only reply with the text above. DO NOT ADD ANY OTHER TEXT IN YOUR REPLY.

    Currently there are only the IT team available, so any task or questions related to the topics mentioned above,
    you can only forward it to the IT team.

    Never assume what the user wants. The user may or may not give tasks or questions immediately.
    For example, at a time the user may want to engage small talk before giving you tasks.
    In this case reply with a polite response, for example, if user say greetings, you reply with a polite grettings back.

    Avoid mentioning to users that if they ask about thet topics mentioned above then they will be forwarded.

    Example:
    User: What's last month best selling product?
    You: Forwarding user to: IT team
    """

    SQL_WRITER_SYSTEM_MESSAGE = f"""\
    You are a expert in SQL.
    Your job is to create the necessary sql queries to retrieve data from database to solve the task assigned to your team.

    When generating sql query always follow these rules:
        1. The database is a PostgreSQL database.
        2. Always limit the result to less than 20 records.
        3. Only generate sql query to retrieve data, never update data or the database structure.
        4. Never make query to retrieve all columns, i.e., do not use asterisks. Always specify the intended columns.

    In this conversation following applies:
        1. Reply with sql query blocks if you want to query data. The sql bot will automatically execute sql queries in sql query blocks.
        2. The sql bot cannot provide any other feedback or perform any other action beyond executing the sql query.
        3. The sql bot also can't modify your sql query. So, do not give incomplete code which requires the bot to modify.
        4. Do not use a sql query block if it's not intended to be executed by the sql bot.
        5. When using sql query, you must indicate the script type in the sql query block.
        6. The sql query block must indicate it's a sql query by adding a language hint like the following:
            ```sql
            [replace this text including the square brackets with your sql query]
            ```
        7. Only one sql query block is for one sql query. Do not put multiple sql queries in one sql query block.
        8. Today's date is {datetime.today().strftime('%Y-%m-%d')}
    """

    DATA_EXPERT_SYSTEM_MESSAGE = """\
    You are a data expert.

    Your job is to interpret data resulted from sql query created by sql writer to more easy to understand human language.

    When you have the answer for the task or question from user, create a summary and mark it with '[TASK_DONE]' at the end of your reply:
    "Your summary for the answer here. [TASK_DONE]"

    It also applies if you don't know how to solve a task or you can't answer user's question,
    politely reply with sentence like 'I apologize, I do not have the answer for your question. [TASK_DONE]'.

    Remember your task is not done until you have the answer OR you don't have the answer at all.
    Do not mark your reply as done when you're still in the process of solving the task with your team.

    In any cases, please always remember these:
        1. The user is a regular end user. The user is not a programmer nor have direct access to database nor have access to technical features.
        2. For tasks related to data, the user expect you to give the final result or final conclusion as your repy.
        3. Avoid using IT terminologies like 'sql', 'sql query', 'sql table', 'sql column', etc., in your final answer.
        4. Never ask user for anything except providing information to help you perform your tasks, always remember you are the assistant.
        5. Never assume currencies. Present numbers as it is without mentioning the currency unless there is information about the currency in the data.
        6. Do not rule out the possibility that there is no data in the database. Empty output or `null` might means there is no data for it.
    """


    def __init__(self, env):
        self.env = env
        self._chat_history = []
        self._restoring_history = False
        self._discuss_channel = None

        self._admin: UserProxyAgent = None
        self._executor: UserProxyAgentForSql = None
        self._receptionist: AssistantAgent = None
        self._groupchat: GroupChatWithMessageCallback = None
        self._manager: ResumingGroupChatManager = None
        self._context_analyst: AssistantAgent = None
        self._data_expert: AssistantAgent = None

    def _on_history_restored(self):
        self._restoring_history = False

    def _load_history(self):
        records = self.env["mail.bot.advai.message"].search(
            [("channel_id", "=", self._discuss_channel.id)], order="id asc"
        )
        res = []
        if records:
            for rec in records:
                json_msg = rec.message
                msg = json.loads(json_msg)
                res.append(msg)

        self._chat_history = res

    def _on_chat_append_message(self, message: Dict, speaker: Agent):
        if not self._restoring_history:
            self._chat_history.append(message)
            self.env["mail.bot.advai.message"].create(
                {"channel_id": self._discuss_channel.id, "message": json.dumps(message)}
            )

    def _retrieve_knowledge_base(self, id):
        kb = self.env["mail.bot.advai.knowledge.base"].browse(id)
        if kb:
            if kb.kb_type == "qa":
                return f"question: {kb.title}\nsql:\n{kb.content}"
            else:
                return f"title: {kb.title}\narticle:\n{kb.content}"
        else:
            return ""

    def _create_agents(self):
        admin = UserProxyAgent(
            "admin",
            description="The user who give tasks and questions.",
            human_input_mode="NEVER",
            is_termination_msg=lambda message: True,  # Always True
            code_execution_config=False,
        )

        conversation_analyst = ConversationAnalystAgent(
            name="context_bot",
            description=f"A bot that provide additional information for tasks related to {KB_TOPICS}.",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG,
            kb_callback=self._retrieve_knowledge_base
        )

        receptionist = AssistantAgent(
            name="receptionist",
            description="The receptionist for the IT team.",
            system_message=dedent(self.RECEPTIONIST_SYSTEM_MESSAGE),
            human_input_mode="NEVER",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG,
        )

        sql_expert = AssistantAgent(
            name="sql_expert",
            description=f"An expert in SQL, a member of the IT team whose job is to create sql queries to solve tasks related to {KB_TOPICS}.",
            system_message=dedent(self.SQL_WRITER_SYSTEM_MESSAGE),
            human_input_mode="NEVER",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG,
        )

        executor = UserProxyAgentForSql(
            "sql_bot",
            env=self.env,
            description="An sql bot that performs no other action than running sql query (provided to it's quoted in sql query blocks).",
            human_input_mode="NEVER",
        )

        data_expert = AssistantAgent(
            name="data_expert",
            description=f"A data expert, a member of the IT team whose job is to interpret data to human language.",
            system_message=dedent(self.DATA_EXPERT_SYSTEM_MESSAGE),
            human_input_mode="NEVER",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG,
        )

        def _speaker_selection_func(last_speaker: Agent, groupchat: GroupChat):
            last_messages = groupchat.messages[-1]
            # last_content = last_messages["content"]
            next_speaker = admin

            if last_speaker is admin:
                if len(groupchat.messages) > 1:
                    last_agent_name = groupchat.messages[-2]["name"]
                    if last_agent_name == data_expert.name: # continue conversation as usual
                        next_speaker = receptionist
                    elif last_agent_name == conversation_analyst.name: # other topic
                        next_speaker = receptionist
                    else: # something went wrong?
                        next_speaker = groupchat.agent_by_name(last_agent_name)
                else:
                    next_speaker = receptionist
            elif last_speaker is receptionist:
                next_speaker = conversation_analyst
            elif last_speaker is conversation_analyst:
                if last_messages["content"] != conversation_analyst.ERROR_MESSAGE:
                    if last_messages["content"].strip() == "": # not about data
                        next_speaker = admin
                    else:
                        next_speaker = sql_expert
            elif last_speaker is sql_expert:
                code_extractor = MarkdownCodeExtractor()
                code_blocks = code_extractor.extract_code_blocks(last_messages["content"])
                if len(code_blocks) > 0:
                    sqls = [o for o in code_blocks if o.language == 'sql']
                    if len(sqls) > 0:
                        next_speaker = executor
                    else:
                        next_speaker = data_expert
            elif last_speaker is executor:
                if last_messages["content"].find("exitcode: -1") > -1:
                    next_speaker = sql_expert
                else:
                    next_speaker = data_expert
            elif last_speaker is data_expert:
                task_done = last_messages["content"].find("[TASK_DONE]")
                if task_done > -1:
                    last_messages["content"] = last_messages["content"][:task_done]
                else:
                    next_speaker = receptionist

            return next_speaker

        groupchat = GroupChatWithMessageCallback(
            agents=[admin, conversation_analyst, receptionist, sql_expert, executor, data_expert],
            messages=[],
            max_round=24,
            speaker_selection_method= _speaker_selection_func,
            # send_introductions=True,
            on_append_message=self._on_chat_append_message,
        )

        manager = ResumingGroupChatManager(
            groupchat=groupchat,
            name="chat_manager",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG,
            history=self._chat_history,
            on_history_restored=self._on_history_restored,
        )

        return (admin, conversation_analyst, receptionist, sql_expert, executor, data_expert, manager, groupchat)

    def query(self, discuss_channel, author_id, message_body):
        message = message_body

        if message == "":
            return

        self._discuss_channel = discuss_channel

        self._restoring_history = True

        self._load_history()

        self._admin,\
        self._context_analyst,\
        self._receptionist,\
        self._sql_expert,\
        self._executor,\
        self._data_expert,\
        self._manager,\
        self._groupchat = self._create_agents()

        self._admin.initiate_chat(self._manager, message=message, silent=True)
        if self._groupchat.messages[-1]["name"] == self._context_analyst.name:
            answer = self._groupchat.messages[-2]["content"]
        else:
            answer = self._groupchat.messages[-1]["content"]

        return answer