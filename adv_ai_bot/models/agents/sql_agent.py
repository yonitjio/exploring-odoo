# -*- coding: utf-8 -*-
import json
import re

import psycopg2 as pg2
from psycopg2.extras import RealDictCursor

from textwrap import dedent
from typing import Callable, Dict, List, Optional, Literal, Optional, Union

from autogen import ConversableAgent
from autogen.coding import CodeExecutor, CodeExtractor, MarkdownCodeExtractor, CodeBlock, CodeResult
from autogen.runtime_logging import log_new_agent, logging_enabled

class SqlQueryCodeExecutor(CodeExecutor):
    def __init__(self, env, **kwargs):
        self.dsn = env.cr._cnx.info.dsn_parameters

    @property
    def code_extractor(self) -> CodeExtractor:
        return MarkdownCodeExtractor()

    @staticmethod
    def sanitize_command(code: str) -> None:
        dangerous_patterns = [
            (r"\bdrop\b", "Use of 'drop' query is not allowed."),
            (r"\binsert\b", "Use of 'insert' query is not allowed."),
            (r"\bupdate\b", "Use of 'update' query is not allowed."),
        ]
        for pattern, message in dangerous_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                raise ValueError(f"Potentially dangerous command detected: {message}")

    def execute_code_blocks(self, code_blocks: List[CodeBlock]) -> CodeResult:
        logs_all = ""
        for idx, code_block in enumerate(code_blocks, start=1):
            lang, code = code_block.language, code_block.code
            lang = lang.lower()

            SqlQueryCodeExecutor.sanitize_command(code)

            if lang != "sql":
                logs_all += "\n" + f"Skipping execution: language not specified (code block #{idx})."
                continue

            try:
                with pg2.connect(**self.dsn) as cnn:
                    with cnn.cursor(cursor_factory=RealDictCursor) as cr:
                        cr.execute(code)
                        cres = cr.fetchall()
                        res_json = json.dumps(cres, default=str)
            except Exception as e:
                exitcode = -1
                logs_all += f"\nError: {str(e)}"
                break
            exitcode = 0
            logs_all += res_json
        return CodeResult(exit_code=exitcode, output=logs_all)

    def restart(self) -> None:
        self.engine.dispose()

class UserProxyAgentForSql(ConversableAgent):
    DEFAULT_USER_PROXY_AGENT_DESCRIPTIONS = {
        "ALWAYS": dedent(\
            """An attentive HUMAN user who can answer questions about the task, and can perform tasks such as running sql query
               or inputting command line commands at a Linux terminal and reporting back the execution results."""),
        "TERMINATE": dedent(\
            """A user that can run sql query or input command line commands at a Linux terminal and report back the execution results."""),
        "NEVER": dedent(\
            """An sql bot that performs no other action than running sql query (provided to it's quoted in sql query blocks)."""),
    }

    def __init__(
        self,
        name: str,
        env: object,
        is_termination_msg: Optional[Callable[[Dict], bool]] = None,
        max_consecutive_auto_reply: Optional[int] = None,
        human_input_mode: Literal["ALWAYS", "NEVER", "TERMINATE"] = "NEVER",
        default_auto_reply: Union[str, Dict] = "",
        description: Optional[str] = None,
    ):
        sql_executor = SqlQueryCodeExecutor(env=env)
        super().__init__(
            name=name,
            is_termination_msg=is_termination_msg,
            max_consecutive_auto_reply=max_consecutive_auto_reply,
            human_input_mode=human_input_mode,
            code_execution_config={"executor": sql_executor},
            default_auto_reply=default_auto_reply,
            description=(
                description if description is not None else self.DEFAULT_USER_PROXY_AGENT_DESCRIPTIONS[human_input_mode]
            ),
        )

        if logging_enabled():
            log_new_agent(self, locals())

    def run_code(self, code, **kwargs):
        return -1, "Not supported", None

    def execute_code_blocks(self, code_blocks):
        return -1, "Not supported"
