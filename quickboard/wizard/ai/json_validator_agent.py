# -*- coding: utf-8 -*-
import json
from jsonschema import validate

from textwrap import dedent
from typing import Any, Callable, Dict, List, Optional, Literal, Optional, Union

from autogen import Agent, ConversableAgent
from autogen.coding import CodeExecutor, CodeExtractor, MarkdownCodeExtractor, CodeBlock, CodeResult
from autogen.runtime_logging import log_new_agent, logging_enabled

class JsonValidator(CodeExecutor):
    def __init__(self, json_schema, **kwargs):
        self.json_schema = json_schema

    @property
    def code_extractor(self) -> CodeExtractor:
        return MarkdownCodeExtractor()

    def execute_code_blocks(self, code_blocks: List[CodeBlock]) -> CodeResult:
        logs_all = ""
        exitcode = 0

        json_code_block_count = 0
        for idx, code_block in enumerate(code_blocks, start=1):
            lang, code = code_block.language, code_block.code
            lang = lang.lower()

            if lang != "json":
                logs_all += "\n" + f"Skipping execution: language not supported (code block #{idx})."
                continue

            try:
                quickboard_json = json.loads(code)
                validate(quickboard_json, self.json_schema)
            except Exception as e:
                exitcode = -1
                logs_all += f"\nError: {str(e)}"
                break
            exitcode = 0
            logs_all += f"Json is valid."
            json_code_block_count += 1

        if (exitcode == 0 and json_code_block_count > 0) or exitcode == -1:
            return CodeResult(exit_code=exitcode, output=logs_all)

        return CodeResult(exit_code=-1, output="Invalid or no json code block was detected, please make sure your code block is marked as json.")

    def restart(self) -> None:
        self.engine.dispose()

class UserProxyAgentForJsonValidation(ConversableAgent):
    DEFAULT_USER_PROXY_AGENT_DESCRIPTIONS = {
        "ALWAYS": dedent(\
            """An attentive HUMAN user who can answer questions about the task, and can perform tasks such as validating json
            using software tools and reporting back the execution results."""),
        "TERMINATE": dedent(\
            """A user that can validate json using software tools and report back the execution results."""),
        "NEVER": dedent(\
            """An bot that performs no other action than validating json (provided to it's quoted in json blocks)."""),
    }

    def __init__(
        self,
        name: str,
        json_schema: object,
        is_termination_msg: Optional[Callable[[Dict], bool]] = None,
        max_consecutive_auto_reply: Optional[int] = None,
        human_input_mode: Literal["ALWAYS", "NEVER", "TERMINATE"] = "NEVER",
        default_auto_reply: Union[str, Dict] = "",
        description: Optional[str] = None,
    ):
        json_validator = JsonValidator(json_schema=json_schema)
        super().__init__(
            name=name,
            is_termination_msg=is_termination_msg,
            max_consecutive_auto_reply=max_consecutive_auto_reply,
            human_input_mode=human_input_mode,
            code_execution_config={"executor": json_validator},
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

    def generate_reply(
        self,
        messages: Optional[List[Dict[str, Any]]] = None,
        sender: Optional["Agent"] = None,
        **kwargs: Any,
    ) -> Union[str, Dict, None]:
        res = super().generate_reply(messages, sender)

        res_ok = True
        if isinstance(res, Dict) and len(dict) == 0:
            res_ok = False
        elif isinstance(res, str) and str == "":
            res_ok = False
        elif res is None:
            res_ok = False

        if not res_ok:
            msg = "Invalid or no json code block was detected, please make sure your code block is marked as json."
            return f"exitcode: -1 (execution failed)\nCode output: {msg}"

        return res
