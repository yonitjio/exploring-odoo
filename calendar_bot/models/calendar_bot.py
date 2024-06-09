# -*- coding: utf-8 -*-

import logging

_logger = logging.getLogger(__name__)

import json
from datetime import datetime
from textwrap import dedent
from typing import Dict, Optional, List #, Any # Include Any when using SilentConsole

from odoo.tools import DEFAULT_SERVER_DATETIME_FORMAT

from autogen import (
    AssistantAgent,
    Agent,
    UserProxyAgent,
    GroupChat,
    register_function
)

# from autogen.io import console, base

from .agents.consts import DEFAULT_AUTOGEN_LLM_CONFIG
from .agents import (
    ResumingGroupChatManager,
    GroupChatWithMessageCallback,
    CalendarUtility,
    get_function_header,
    get_date
)

# class SilentConsole(console.IOConsole):
#     def print(self, *objects: Any, sep: str = " ", end: str = "\n", flush: bool = False) -> None:
#         pass

# base.IOStream.set_global_default(SilentConsole())
# base.IOStream.set_default(SilentConsole())


class CalendarBot:
    CALENDAR_BOT_SYSTEM_MESSAGE = f"""
    You are a polite and helpful AI assistant.
    Today's date is {datetime.today().strftime("%A, %B %d, %Y")}

    Your main task is to assist user to create, remove and list user's schedules,

    But remember user may not immediately ask you to do tasks related to schedules.
    For example user may want to engage small talk first. Accompanying user is your job too.

    When given tasks related to schedules, analyze user's intention carefully, for example, if on Friday, user say 'this Saturday',
    it mean the Saturday that comes one day after the Friday, NOT the Saturday on the next week.

    Another example is if user has previously mentioned tomorrow, it does NOT mean the subsequent tasks is for one day after.

    Always remember to analyze user's intention carefully.

    If there is a possibility of discrepancies between what user asked and your understanding for the task, always make confirmation to the user first before doing anything.

    Always follow these rules:
        1. Use this format '{DEFAULT_SERVER_DATETIME_FORMAT}' for datetime parameter.
        2. After creating or modifying a schedule, include the link from the function result in your answer.
        3. Weekday names are 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'.
        4. Month names are 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', and 'December'.
        5. Use function `get_date` as the ground truth for dates.
        6. It's better to verify the current date with function `get_date` first before calling other functions.
        7. For date and day calculation use 0 as current date. Add 1 for 1 day after today, 2 for 2 days and so on.
        8. Avoid calling the same function with the same parameters repeatedly.

    Examples:
        1. If current day is Friday, and you want to know what date is Sunday, the delta is 2, because current day is 0, that means 1 is Saturday, and 2 is Sunday.
        2. If current day is Saturday, and you want to know what date is Monday, the delta is 2, because current day is 0, that means 1 is Sunday, and 2 is Monday.
    """

    def __init__(self, env):
        self.env = env
        self._chat_history = []
        self._restoring_history = False
        self._discuss_channel = None

        self._admin: UserProxyAgent = None
        self._executor: UserProxyAgent = None
        self._calendar_bot: AssistantAgent = None
        self._groupchat: GroupChatWithMessageCallback = None
        self._manager: ResumingGroupChatManager = None

    def _on_history_restored(self):
        self._restoring_history = False

    def _load_history(self):
        records = self.env["mail.bot.calendar.message"].search(
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
            self.env["mail.bot.calendar.message"].create(
                {"channel_id": self._discuss_channel.id, "message": json.dumps(message)}
            )

    def _build_functions(self):
        def manage_schedule(command: str,
                        schedule_ids: List[int] = None,
                        title: str = None,
                        description: str = None,
                        start_datetime: datetime = None,
                        stop_datetime: datetime = None) -> str:
            """Function to manage schedules.
            Use "create" as command to create schedule.
            Use "edit" as command to modify schedule.
            Use "remove" as command to delete schedule(s).
            Use "list" as command to retrieve schedule(s).

            Command "edit" requires one item in schedule_ids list, otherwise it will throw an error.

            Args:
                command ("create"|"edit"|"remove"|"list"): command to be executed.
                schedule_ids (List[int]): database record id of schedules.
                title (str): title of the schedule.
                description (str): description of the schedule.
                start_datetime (datetime): starting date and time of the schedule.
                stop_datetime (datetime): stop date and time of the schedule.

            Returns:
                str: Result of the command execution.
            """
            result = "error"
            match command:
                case "create":
                    result = CalendarUtility(self.env).create_schedule(start_datetime, stop_datetime, title, description)
                case "edit":
                    if len(schedule_ids) != 1:
                        raise ValueError("Edit command requires only one schedule_id.")
                    schedule_id = schedule_ids[0]
                    result = CalendarUtility(self.env).edit_schedule(schedule_id, start_datetime, stop_datetime, title, description)
                case "remove":
                    result = CalendarUtility(self.env).remove_schedules(schedule_ids, start_datetime, stop_datetime)
                case "list":
                    result = CalendarUtility(self.env).retrieve_schedule(start_datetime, stop_datetime)

            if result == "error":
                raise ValueError("Invalid command.")

            result = {
                "name": "manage_schedule",
                "content": result
            }
            return json.dumps(result, default=str)

        manage_schedule_desc = get_function_header(manage_schedule)
        register_function(manage_schedule, caller=self._calendar_bot, executor=self._executor, description=manage_schedule_desc)

        get_date_desc = get_function_header(get_date)
        register_function(get_date, caller=self._calendar_bot, executor=self._executor, description=get_date_desc)

    def _create_agents(self):
        admin = UserProxyAgent(
            "admin",
            description="The user who give tasks and questions.",
            human_input_mode="NEVER",
            is_termination_msg=lambda message: True,  # Always True
            code_execution_config=False,
        )

        calendar_bot = AssistantAgent(
            name="calendar_bot",
            description="A smart and useful AI assistant.",
            system_message=dedent(self.CALENDAR_BOT_SYSTEM_MESSAGE.strip()),
            human_input_mode="NEVER",
            llm_config=DEFAULT_AUTOGEN_LLM_CONFIG,
        )

        executor = UserProxyAgent(
            "calendar_bot",
            description="An calendar bot that performs no other action than to create, edit and remove schedules on user's calendar.",
            human_input_mode="NEVER",
            code_execution_config={
                "work_dir": ".",
                "use_docker": False,
            },
        )

        def _speaker_selection_func(last_speaker: Agent, groupchat: GroupChat):
            messages = groupchat.messages
            next_speaker = admin

            if "function_call" in messages[-1] or "tool_calls" in messages[-1]:
                return executor

            if last_speaker is admin:
                next_speaker = calendar_bot
            elif last_speaker is executor:
                next_speaker = calendar_bot

            return next_speaker

        groupchat = GroupChatWithMessageCallback(
            agents=[admin, calendar_bot, executor],
            messages=[],
            max_round=100,
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

        self._admin = admin
        self._calendar_bot = calendar_bot
        self._executor = executor
        self._manager = manager
        self._groupchat = groupchat

        self._build_functions()

    def query(self, discuss_channel, author_id, message_body):
        message = message_body

        if message == "":
            return

        self._discuss_channel = discuss_channel

        self._restoring_history = True

        self._load_history()

        self._create_agents()

        self._admin.initiate_chat(self._manager, message=message, silent=True)
        answer = self._groupchat.messages[-1]["content"]

        return answer