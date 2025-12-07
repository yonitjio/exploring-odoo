import json

from typing import Dict, List, Literal, Optional, Tuple, Union

from autogen import Agent

from .sentence_analyst_agent import SentenceAnalystAgent

class ArticleAnalystAgent(SentenceAnalystAgent):
    _RULES = """
    1. Remember only to reply with the correct json that complies with the json schema mentioned in the instruction,
       without any other text, preamble, or postamble.
    2. Analyze the whole article carefully and then provide short and precise summary without loosing the meaning of the article.
    """

    DEFAULT_SYSTEM_MESSAGE = f"""\
    ### INSTRUCTION
    You are an expert in context analysis.
    Your task is to analyze an article and summarize it.

    Use the following json schema for answering:
    {{
        "title": "Context Analysis",
        "type": "object",
        "properties": {{
            "summary": {{
                "type": "string"
            }}
        }},
        "required": [
            "summary"
        ]
    }}

    For example:
    {{ "summary": "your summary here" }}

    ### RULES
    {_RULES}
    """

    DEFAULT_DESCRIPTION = "A context analyst whose job is to summarize an article."

    def __init__(
        self,
        name: str,
        verbose: bool = True,
        system_message: Optional[str] = None,
        description: Optional[str] = None,
        llm_config: Optional[Union[Dict, Literal[False]]] = None,
    ):
        super().__init__(
            name,
            verbose=verbose,
            system_message=self.DEFAULT_SYSTEM_MESSAGE if system_message is None else system_message,
            description=self.DEFAULT_DESCRIPTION if description is None else description,
            llm_config=llm_config
        )
        self.register_reply(Agent, ArticleAnalystAgent.generate_context_analytic_reply, remove_other_reply_funcs= True)

    def _response_to_json(self, text):
        try:
            res = json.loads(text)
            if "summary" not in res:
                raise ValueError("Invalid value.")
            return res
        except Exception as e:
            return False

    def generate_context_analytic_reply(self,
                        messages: Optional[List[Dict]] = None,
                        sender: Optional[Agent] = None,
                        config: Optional[list] = None, **kwargs) -> Tuple[bool, Optional[str]]:

        # First agent is initiator?
        msg_for_analyst = f"""Analyze this article:
        {messages[-1]["content"]}
        """

        client = self.client if config is None else config
        if client is None:
            result = False
        else:
            result = self._analyze_context(client, msg_for_analyst)

        reply = ""
        if result == False:
            reply = self.ERROR_MESSAGE
        else:
            reply = result["summary"]

        return True, reply