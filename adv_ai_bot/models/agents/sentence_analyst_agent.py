import json

from typing import Dict, List, Literal, Optional, Tuple, Union

from autogen import Agent, ConversableAgent

from .consts import KB_TOPICS

class SentenceAnalystAgent(ConversableAgent):
    _RULES = """
    1. Remember to reply ONLY with the correct json that complies with the json schema mentioned in the instruction.
       Do not add reasoning or any other text, preamble, or postamble.
    2. Analyze the whole sentence carefully.
    3. Remember you are on our side, the topic of this sentence "A person purchases this product from our store." is "Sales", not "Purchase".
    """

    DEFAULT_SYSTEM_MESSAGE = f"""\
    ### INSTRUCTION
    You are an expert in context analysis.
    Your task is to analyze sentences and decide the topic of the sentences.

    Answer only with one or more of the following topics:
    {KB_TOPICS}

    Other than the mentioned topics above, answer with "Other" as the topic.

    Use the following json schema for answering:
    {{
        "title": "Context Analysis",
        "type": "object",
        "properties": {{
            "topics": {{
            "type": "string"
            }}
        }},
        "required": [
            "topics"
        ]
    }}

    Example #1:
    Sentences: How are you today?
    Analysis: {{"topics": "Other"}}

    Example #2:
    Sentences: Can you give me sales data?
    Analysis: {{"topics": "Sales"}}

    Example #3:
    Sentences: Do we have "August Alexander" for our customer?
    Analysis: {{"topics": "Customer"}}

    Example #4:
    Sentences: Querying Purchasing Data Guide
    Analysis: {{"topics": "Purchases"}}

    Example #5:
    Sentences: Top 10 Best Selling Products.
    Analysis: {{"topics": "Sales, Products"}}

    ### RULES
    {_RULES}
    """

    DEFAULT_DESCRIPTION = "A context analyst whose job is to generate topics of a sentence."

    ERROR_MESSAGE = "Unable to analyze the sentence(s). Please try it again later."

    _WRONG_ANSWER_TEMPLATE = f"""
    You did not answer according to the json schema mentioned in the instruction.
    As a reminder, please follow these rules:
    {_RULES}

    DO NOT add preamble, postamble or any text for any reason.
    """

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
            human_input_mode="NEVER",
            description=self.DEFAULT_DESCRIPTION if description is None else description,
            system_message=self.DEFAULT_SYSTEM_MESSAGE if system_message is None else system_message,
            llm_config=llm_config
        )
        self._verbose = verbose

        self.register_reply(Agent, SentenceAnalystAgent.generate_context_analytic_reply, remove_other_reply_funcs= True)

    def _response_to_json(self, text):
        try:
            res = json.loads(text)
            if "topics" not in res:
                raise ValueError("Invalid value.")
            return res
        except Exception as e:
            return False

    def _analyze_context(self, client, text):
        max_attempts = 3
        wrong_answer_message = [
            {
                "content": self._WRONG_ANSWER_TEMPLATE,
                "role": "user"
            }
        ]

        oai_text = [
            {
                "content": text,
                "role": "user"
            }
        ]

        result = False
        oai_msg = self._oai_system_message + oai_text
        for i in range(max_attempts):
            response = self._generate_oai_reply_from_client(
                client, oai_msg, self.client_cache
            )

            result = self._response_to_json(response)

            if result == False:
                response_msg = [
                    {
                        "content": result,
                        "role": "assistant"
                    }
                ]
                oai_msg += response_msg + wrong_answer_message
            else:
                break

        return result


    def generate_context_analytic_reply(self,
                        messages: Optional[List[Dict]] = None,
                        sender: Optional[Agent] = None,
                        config: Optional[list] = None, **kwargs) -> Tuple[bool, Optional[str]]:

        # First agent is initiator?
        msg_for_analyst = f"""Analyze this sentence(s):
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
            topics = result["topics"]
            if isinstance(topics, str):
                reply = topics
            elif isinstance(topics, list):
                reply = ", ".join(topics)

        return True, reply