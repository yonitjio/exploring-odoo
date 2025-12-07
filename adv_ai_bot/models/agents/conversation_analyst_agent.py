import json

from textwrap import dedent

from typing import Dict, List, Literal, Optional, Tuple, Union, Callable

from autogen import Agent, GroupChatManager

from .sentence_analyst_agent import SentenceAnalystAgent
from .consts import KB_TOPICS
from . import get_related_qas, get_related_articles

class ConversationAnalystAgent(SentenceAnalystAgent):
    _RULES = """
    1. Remember only to reply with the correct json that complies with the json schema mentioned in the instruction,
       without any other text, preamble, or postamble.
    2. Analyze the whole conversation thoroughly and carefully.
    3. Do not differentiate between plural or singular topics, e.g., when talking about a customer, the topic is still 'Customers'.
    4. If the conversation is still in the phase where the parties are introducing themself, set the topic as 'Other'.
    5. The topic for conversation about best selling products are 'Sales, Products'.
    """

    DEFAULT_SYSTEM_MESSAGE = f"""\
    ### INSTRUCTION
    You are an expert in context analysis.
    Your task is to analyze a conversation and decide what is the LAST topic(s) of the conversation.

    Answer only with one or more of the following topics:
    {KB_TOPICS}

    Other than the mentioned topics above, answer with "Other" as the topic.

    Analyze the conversation flow thoroughly and carefully, pay attention to the flow and the changing topics in the conversation.
    Remember to always answer with the LAST topic of the conversation.

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
    Conversation:
        A: Do we have a customer named 'Billy Joel'?

    Analysis: {{"topics": "Customers"}}

    Example #2:
    Conversation:
        A: How are you today?
        B: I'm fine, thank you. How about you?

    Analysis: {{"topics": "Other"}}

    Example #3:
    Conversation:
        A: How are you today?
        B: I'm fine, thank you. How about you?
        A: I'm fine too, thank you for asking. Can you give me sales data?

    Analysis: {{"topics": "Sales"}}

    Example #4:
    Conversation:
        A: How are you today?
        B: I'm fine, thank you. How about you?
        A: I'm fine too, thank you for asking. Could you query how much sales we made this month?
        Topic: Sales
        B: Certainly, we have sold $1000 this month.
        A: Do we have "August Alexander" for our customer?

    Analysis: {{"topics": "Customers"}}

    Example #5:
    Conversation:
        A: How are you today?
        B: I'm fine, thank you. How about you?
        A: I'm fine too, thank you for asking. Could you query how much sales we made this month?
        <topic>sales</topic>
        B: Certainly, we have sold $1000 this month.
        A: Do we have "August Alexander" for our customer?
        <topic>customer</topic>
        B: Yes, we do have "August Alexander" in our database as a customer.
        A: How is your kids doing?

    Analysis: {{"topics": "Other"}}

    ### RULES
    {_RULES}
    """

    DEFAULT_DESCRIPTION = "A bot that automatically provide additional information about the topic in the groupchat."

    ERROR_MESSAGE = "Unable to analyze the conversation. Please try it again later."

    _POSSIBLE_TOPIC_TEMPLATE = "The context of this conversation might related to these topics: "

    _WRONG_ANSWER_TEMPLATE = f"""
    You did not answer according to the json schema mentioned in the instruction.
    As a reminder, please follow these rules:
    {_RULES}

    DO NOT add preamble, postamble or any text for any reason.
    """

    _QA_TEMPLATE = """
    ## Examples
    {kb}
    """

    _ARTICLE_TEMPLATE = """
    ## Articles
    {kb}
    """

    def __init__(
        self,
        name: str,
        verbose: bool = True,
        system_message: Optional[str] = None,
        description: Optional[str] = None,
        kb_callback: Optional[Callable] = None,
        llm_config: Optional[Union[Dict, Literal[False]]] = None,
    ):
        super().__init__(
            name,
            verbose=verbose,
            system_message=self.DEFAULT_SYSTEM_MESSAGE if system_message is None else system_message,
            description=self.DEFAULT_DESCRIPTION if description is None else description,
            llm_config=llm_config
        )
        self._kb_callback = kb_callback
        self.register_reply(Agent, ConversationAnalystAgent.generate_context_analytic_reply, remove_other_reply_funcs= True)

    def generate_context_analytic_reply(self,
                        messages: Optional[List[Dict]] = None,
                        sender: Optional[Agent] = None,
                        config: Optional[list] = None, **kwargs) -> Tuple[bool, Optional[str]]:

        assert isinstance(sender, GroupChatManager), "Sender must be an instance of GroupChatManager"

        # First agent is initiator?
        conversation_messages = sender.chat_messages_for_summary(sender.groupchat.agents[0])

        conversation = ""
        existing_topics = []
        other_topics = ["Other", "Others"]
        for msg in conversation_messages:
            if len(msg["content"]) > 0:
                if msg["name"] == self.name:
                    topic_string = msg["content"].splitlines()[0] # topics of the conversation
                    topics = topic_string.replace(self._POSSIBLE_TOPIC_TEMPLATE, "").strip().split(",")
                    for topic in topics:
                        if topic not in existing_topics:
                            existing_topics.append(topic.replace(".", "").strip())

                    conversation += f'\n\t{topic}'
                else:
                    conversation += f'\n\t{msg["name"]}: {msg["content"]}'

        msg_for_analyst = f"""Analyze this conversation:
        {conversation}
        """

        client = self.client if config is None else config
        if client is None:
            result = False
        else:
            result = self._analyze_context(client, msg_for_analyst)

        reply = ""
        if result == False:
            reply = self.ERROR_MESSAGE
        elif self._kb_callback is not None:
            result_topics = result["topics"]
            if isinstance(result_topics, str):
                current_topics = result_topics.split(",")
            elif isinstance(result_topics, list):
                current_topics = result_topics

            is_other_topic = False
            for topic in current_topics:
                if topic.replace(".", "").strip() in other_topics:
                    is_other_topic = True

            if not is_other_topic:
                new_topic = False
                for topic in current_topics:
                    if topic.replace(".", "").strip() not in existing_topics:
                        new_topic = True
                res = f'{self._POSSIBLE_TOPIC_TEMPLATE}{result["topics"]}.\n'
                if new_topic:
                    text = ",".join(current_topics)
                    articles = get_related_articles(text)
                    qas = get_related_qas(text)

                    res += 'Please find the followings for your references regarding the topics.'
                    if articles and len(articles) > 0:
                        txt = ""
                        for article in articles:
                            art_text = self._kb_callback(article)
                            if (art_text.strip() != ""):
                                txt += self._kb_callback(article) + "\n"
                        res += dedent(self._ARTICLE_TEMPLATE).format(kb=txt)

                    if qas and len(qas) > 0:
                        txt = ""
                        for qa in qas:
                            qa_text = self._kb_callback(qa)
                            if (qa_text.strip() != ""):
                                txt += qa_text + "\n"
                        res += dedent(self._QA_TEMPLATE).format(kb=txt)

                reply = res

        return True, reply