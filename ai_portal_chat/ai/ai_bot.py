# region imports
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

import logging
_logger = logging.getLogger(__name__)

import asyncio
import concurrent.futures
from textwrap import dedent

from odoo.api import Environment
from odoo.modules.registry import Registry

from openai import AsyncOpenAI

from semantic_kernel.agents import ChatCompletionAgent

from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
from semantic_kernel.connectors.ai.function_choice_behavior import FunctionChoiceBehavior

from semantic_kernel.contents import ChatMessageContent
from semantic_kernel.contents.chat_history import ChatHistory
from semantic_kernel.contents.utils.author_role import AuthorRole
from semantic_kernel.contents.streaming_text_content import StreamingTextContent

from semantic_kernel.kernel import Kernel
from semantic_kernel.functions import KernelArguments

from . import consts
from .utils import html_to_md
# endregion

class AiBot:
    AGENT_NAME = "odoo_ai_bot"
    AGENT_INSTRUCTIONS = dedent("""
        Your name is Frodoo. You are a helpful AI assistant.
    """)
    def __init__(self, env: Environment | None, context):
        if env is None:
            raise Exception("Environment is not set.")
        self.env = env

        self._api_key = consts.API_KEY
        self._base_url = consts.BASE_URL
        self._ai_model = consts.AI_MODEL
        self._default_header = consts.DEFAULT_HEADER

        self._kernel = Kernel()

        agent_instruction = AiBot.AGENT_INSTRUCTIONS
        if context is not None:
            if "content" in context and "base_url" in context:
                try:
                    content = html_to_md(context["base_url"], context["content"])
                    blog_instruction = dedent(f"""
                        # Context: the user is browsing on a web page.
                        # Web Page Content: {content}
                        # Important:
                            - Do not explicitly mention about the context unless asked.
                            - Do not answer outside the context.
                            - Ignore everything you know, only answer based on the context and the web page content.
                            - The webpage can be an ecommerce page or a blog page.
                    """)
                    agent_instruction = agent_instruction + blog_instruction
                except Exception as e:
                    _logger.error(e)
                    raise

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
                id=self._service_id,
                service = service,
                kernel=self._kernel,
                name=AiBot.AGENT_NAME,
                instructions=agent_instruction,
                arguments=KernelArguments(settings)
            )

        self._chat_history = ChatHistory()

    def _send_stream_to_client(self, channel, content):
        try:
            with Registry(self.env.cr.dbname).cursor() as cr:
                my_env = Environment(cr, self.env.uid, self.env.context)
                my_env.user._bus_send(channel, content)

            return True
        except:
            return False

    async def _stream_chat(self, channel, message, history):
        try:
            for hist in history:
                if hist["role"] == "user":
                    self._chat_history.add_user_message(hist["text"])
                elif hist["role"] == "assistant":
                    self._chat_history.add_assistant_message(hist["text"])

            self._chat_history.add_message(ChatMessageContent(AuthorRole.USER, content=message["text"]))

            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                async for msg in self._agent.invoke_stream(self._chat_history):
                    if msg.role == AuthorRole.ASSISTANT:
                        _logger.info("AI: %s", msg.content)
                        if len(msg.items) > 0 and type(msg.items[0]) == StreamingTextContent:
                            pool.submit(self._send_stream_to_client, channel, { "message": { "text": msg.content }, "stop": False })
                            await asyncio.sleep(0)
                            # self._send_stream_to_client({ "message": msg.content, "stop": False })

                pool.submit(self._send_stream_to_client, channel, { "message": "", "stop": True})
                # self._send_stream_to_client({ "message": "", "stop": True})

                pool.shutdown(wait=True)
        except Exception as e:
            _logger.error(e)
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

    def chat(self, channel, message, history, streaming):
        if streaming:
            res = self.run_async_function(self._stream_chat, channel, message, history)
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
