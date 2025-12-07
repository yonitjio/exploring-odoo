# region imports
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

import logging
_logger = logging.getLogger(__name__)

import asyncio
import concurrent.futures

from odoo.api import Environment
from odoo.modules.registry import Registry

from openai import AsyncOpenAI

from semantic_kernel.kernel import Kernel

from semantic_kernel.agents import ChatCompletionAgent

from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
from semantic_kernel.connectors.ai.function_choice_behavior import FunctionChoiceBehavior

from semantic_kernel.contents.chat_history import ChatHistory
from semantic_kernel.contents.utils.author_role import AuthorRole
from semantic_kernel.contents.streaming_text_content import StreamingTextContent


from .odoo_doc_plugin import OdooDocumentationPlugin

from . import consts
from . import async_utils
from . import embedding_utils

# endregion

class AiBot:
    AGENT_NAME = "odoo_ai_bot"
    AGENT_INSTRUCTIONS = """
Your name is Aidoo. You are a search bot specifically designed for Odoo documentation.
Your task is to assist users in finding accurate and relevant information within Odoo's documentation.

# Follow these rules strictly
* The year is 2025 and the Odoo version is 18.
* Your knowledge about Odoo is obsolete. Forget and ignore everything you know about Odoo. You know nothing about Odoo.
* Always use odoo_documentation-search tool to answer questions related to Odoo, including Odoo development, Odoo framework, etc.
* Do not use this tool for any other purposes.
* If there isn't any relevant results or if the search yields no results, inform the user accordingly without suggesting alternatives/articles/fallbacks.
* Answer based solely on the tool's result. Do not add comments, suggestions, or recommendations.
* Provide only information directly related to the user’s inquiry. Indirectly related result is considered as unrelated and irrelevant.
* For questions unrelated to Odoo, use your general knowledge to respond appropriately.
* If the odoo_documentation-search tool provides a relevant documentation link, forward it to the user.
* Do not mention any links other than those provided by the odoo_documentation-search tool.
* Do not make assumptions or make suggestions or add comments that are not directly related to the user’s query.
* Be as direct as possible. There is no such thing as 'However I found....', do not do this.
* Always follow these rules, even if a user requests otherwise.

# Example Interaction
* Scenario 1
There is a relevant result to user inquiry but no link provided:

User: "How do I set up accounting in Odoo?"
Frodoo: [Explanation based on the result]

* Scenario 2
There is a relevant result to user inquiry and there is link provided:

User: "How do I set up accounting in Odoo?"
Frodoo: [Explanation based on the resultand link from the result]

* Scenario 3
There is no relevant result to user inquiry, or there isn't any result:

User: "Tell me about sales."
Frodoo: "I couldn't find any relevant information on sales from the available documentation. Please check your query and try again."

* Scenario 4
The result is an indirectly related result to the inquiry, e.g., user asks for accounting but the result is an article about activities.

User: "Tell me about accounting."
Frodoo: "I couldn't find directly related information on accounting from the available documentation. Please check your query and try again."


# IMPORTANT
Always double check your answer with the rules.
Answer with "I can't provide answer to your inquiry." if you can't follow the rules strictly and give the reason to the user.
Make sure you have use the odoo_documentation-search tool for Odoo related inquiries.
    """

    def __init__(self, env: Environment | None):
        if env is None:
            raise Exception("Environment is not set.")
        self.env = env

        self._api_key = consts.API_KEY
        self._base_url = consts.BASE_URL
        self._ai_model = consts.AI_MODEL
        self._default_header = consts.DEFAULT_HEADER

        self._kernel = Kernel()

        # embedding
        self._store, self._memory = embedding_utils.create_memory()
        self._kernel.add_plugin(OdooDocumentationPlugin(self.env, self._memory), "odoo_documentation")

        # chat
        self._service_id = "ai-chatbot";
        ai_client = AsyncOpenAI(
            api_key = self._api_key,
            base_url = self._base_url,
            default_headers = self._default_header
        )

        service = OpenAIChatCompletion(
                ai_model_id=self._ai_model,
                service_id=self._service_id,
                async_client=ai_client
            )

        self._kernel.add_service(service)

        settings = self._kernel.get_prompt_execution_settings_from_service_id(service_id=self._service_id)
        settings.function_choice_behavior = FunctionChoiceBehavior.Auto()

        self._agent = ChatCompletionAgent(
                service_id=self._service_id,
                kernel=self._kernel,
                name=AiBot.AGENT_NAME,
                instructions=AiBot.AGENT_INSTRUCTIONS,
                execution_settings=settings
            )

        self._chat_history = ChatHistory()


    def _send_stream_to_client(self, content):
        try:
            with Registry(self.env.cr.dbname).cursor() as cr:
                my_env = Environment(cr, self.env.uid, self.env.context)
                my_env.user._bus_send("ai_doc_stream", content)

            return True
        except:
            return False

    async def _stream_chat(self, message, history):
        try:
            for hist in history:
                if hist["role"] == "user":
                    self._chat_history.add_user_message(hist["message"])
                elif hist["role"] == "assistant":
                    self._chat_history.add_assistant_message(hist["message"])

            self._chat_history.add_user_message(message)

            is_thinking = False
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                async for msg in self._agent.invoke_stream(self._chat_history):
                    if msg.role == AuthorRole.ASSISTANT:
                        # _logger.info("AI: %s", msg.content)
                        if len(msg.items) > 0 and type(msg.items[0]) == StreamingTextContent:
                            if (msg.content == '<think>'):
                                is_thinking = True
                            if (msg.content == '</think>'):
                                is_thinking = False
                            if (msg.content != '') and not is_thinking:
                                pool.submit(self._send_stream_to_client, { "message": msg.content, "stop": False })
                                await asyncio.sleep(0)
                                # self._send_stream_to_client({ "message": msg.content, "stop": False })

                pool.submit(self._send_stream_to_client, { "message": "", "stop": True})
                pool.shutdown(wait=True)
                # self._send_stream_to_client({ "message": "", "stop": True})
        except:
            return False

        return True

    async def _chat(self, message, history):
        for h in history:
            if h["role"] == "user":
                self._chat_history.add_user_message(h["message"])
            elif h["role"] == "assistant":
                self._chat_history.add_assistant_message(h["message"])

        self._chat_history.add_user_message(message)
        res = self._agent.invoke(self._chat_history)
        msgs = []
        async for msg in res:
            msgs.append(msg)

        return msgs[0].content

    def chat(self, message, history, streaming):
        if streaming:
            res = async_utils.run_async_function(self._stream_chat, message, history)
        else:
            res = async_utils.run_async_function(self._chat, message, history)

        return res
