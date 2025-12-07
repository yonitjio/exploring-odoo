# region imports 
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

import logging
_logger = logging.getLogger(__name__)

from openai import AsyncOpenAI

from semantic_kernel.kernel import Kernel

from semantic_kernel.agents import ChatCompletionAgent

from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
from semantic_kernel.connectors.ai.function_choice_behavior import FunctionChoiceBehavior

from semantic_kernel.contents.chat_history import ChatHistory

from . import consts
from . import async_utils

# endregion

class Summarizer:
    AGENT_NAME = "summarizer"
    AGENT_INSTRUCTIONS = """
        You are a smart assistant.
        Your task is to summarize articles.
        Always make the summary as short as possible without loosing the essence of the article.
    """
    def __init__(self):
        self._api_key = consts.API_KEY
        self._base_url = consts.BASE_URL
        self._ai_model = consts.AI_MODEL
        self._default_header = consts.DEFAULT_HEADER

        self._kernel = Kernel()

        # chat
        self._service_id = "ai-summarizer";
        ai_client = AsyncOpenAI(api_key=self._api_key, base_url=self._base_url, default_headers=self._default_header)
        service = OpenAIChatCompletion(ai_model_id=self._ai_model, service_id=self._service_id, async_client=ai_client)

        self._kernel.add_service(service)

        settings = self._kernel.get_prompt_execution_settings_from_service_id(service_id=self._service_id)
        settings.function_choice_behavior = FunctionChoiceBehavior.Auto()

        self._agent = ChatCompletionAgent(
                service_id=self._service_id,
                kernel=self._kernel,
                name=Summarizer.AGENT_NAME,
                instructions=Summarizer.AGENT_INSTRUCTIONS,
                execution_settings=settings
            )

        self._chat_history = ChatHistory()

    async def summarize_async(self, text):
        msg = "Summarize this:\n" + text
        self._chat_history.add_user_message(msg)
        res = self._agent.invoke(self._chat_history)
        msgs = []
        async for msg in res:
            msgs.append(msg)

        return msgs[0].content

    def summarize(self, text):
        res = async_utils.run_async_function(self.summarize_async, text)
        return res
