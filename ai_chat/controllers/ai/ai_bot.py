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

from semantic_kernel.agents import ChatCompletionAgent

from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
from semantic_kernel.connectors.ai.function_choice_behavior import FunctionChoiceBehavior

from semantic_kernel.contents.chat_history import ChatHistory
from semantic_kernel.contents.utils.author_role import AuthorRole
from semantic_kernel.contents.streaming_text_content import StreamingTextContent

from semantic_kernel.kernel import Kernel
# endregion

class AiBot:
    AGENT_NAME = "odoo_ai_bot"
    AGENT_INSTRUCTIONS = """
        Your name is Frodoo. You are a helpful AI assistant.
    """
    def __init__(self, env: Environment | None):
        if env is None:
            raise Exception("Environment is not set.")
        self.env = env

        self.service_id = "ai-chatbot";
        openAIClient = AsyncOpenAI(
            api_key="-lm-studio-",
            base_url="http://localhost:1234/v1",
            default_headers={ 'Connection': 'close' }
        )

        service = OpenAIChatCompletion(
                ai_model_id="meta-llama-3.1-8b-instruct",
                service_id=self.service_id,
                async_client=openAIClient
            )

        self._kernel = Kernel()
        self._kernel.add_service(service)

        settings = self._kernel.get_prompt_execution_settings_from_service_id(service_id=self.service_id)
        settings.function_choice_behavior = FunctionChoiceBehavior.Auto()
        self._agent = ChatCompletionAgent(
                service_id=self.service_id,
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
                my_env.user._bus_send("ai_bot_stream", content)

            # self.env.user._bus_send("ai_bot_stream", content) # This is not the way

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

            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                async for msg in self._agent.invoke_stream(self._chat_history):
                    if msg.role == AuthorRole.ASSISTANT:
                        _logger.info("AI: %s", msg.content)
                        if len(msg.items) > 0 and type(msg.items[0]) == StreamingTextContent:
                            pool.submit(self._send_stream_to_client, { "message": msg.content, "stop": False })
                            await asyncio.sleep(0)
                            # self._send_stream_to_client({ "message": msg.content, "stop": False })

                pool.submit(self._send_stream_to_client, { "message": "", "stop": True})
                # self._send_stream_to_client({ "message": "", "stop": True})

                pool.shutdown(wait=True)
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
            res = self.run_async_function(self._stream_chat, message, history)
        else:
            res = self.run_async_function(self._chat, message, history)

        return res

    def run_async_function(self, func_to_run, *args):
        new_loop = asyncio.new_event_loop()
        try:
            asyncio.set_event_loop(new_loop)
            return new_loop.run_until_complete(func_to_run(*args))
        except:
            pass
        finally:
            try:
                new_loop.close()
            except:
                pass
