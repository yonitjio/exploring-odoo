# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

# region imports
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

import logging
_logger = logging.getLogger(__name__)

import asyncio
import concurrent.futures

from odoo.api import Environment
from odoo.modules.registry import Registry

from semantic_kernel.contents.utils.author_role import AuthorRole
from semantic_kernel.contents.streaming_text_content import StreamingTextContent

from . import async_utils
# endregion

class Streamer:
    def __init__(self, env: Environment | None):
        if env is None:
            raise Exception("Environment is not set.")

        self.env = env

    def _send_stream_to_client(self, channel, content):
        try:
            with Registry(self.env.cr.dbname).cursor() as cr:
                my_env = Environment(cr, self.env.uid, self.env.context)
                my_env.user._bus_send(channel, content)

            return True
        except:
            return False

    async def _stream_agent_chat(self, chitchat, channel, message, history):
        try:
            for hist in history:
                if hist["role"] == "user":
                    chitchat.chat_history.add_user_message(hist["message"])
                elif hist["role"] == "assistant":
                    chitchat.chat_history.add_assistant_message(hist["message"])

            chitchat.chat_history.add_user_message(message)

            is_thinking = False
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                async for msg in chitchat.chat.invoke_stream(chitchat.chat_history):
                    if msg.role == AuthorRole.ASSISTANT:
                        if len(msg.items) > 0 and type(msg.items[0]) == StreamingTextContent:
                            if (msg.content == '<think>'):
                                is_thinking = True
                            if (msg.content == '</think>'):
                                is_thinking = False
                            if (msg.content != '') and not is_thinking:
                                pool.submit(self._send_stream_to_client, channel, { "message": msg.content, "stop": False })
                                await asyncio.sleep(0)

                future = pool.submit(self._send_stream_to_client, channel, { "message": "", "stop": True})
                future.result()
                pool.shutdown(wait=True)
        except Exception as e:
            try:
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                    pool.submit(self._send_stream_to_client, channel, { "message": "", "stop": True})
                    future = pool.submit(self._send_stream_to_client, channel, { "message": "", "stop": True})
                    future.result()
                    pool.shutdown(wait=True)
            except Exception as e2:
                _logger.error(e2)
            _logger.error(e)
            return False

        return True

    async def _stream_group_chat(self, chitchat, channel, message):
        try:
            await chitchat.chat.add_chat_message(message=message)
            is_thinking = False
            is_first_chunk = True
            current_agent = ""
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                async for msg in chitchat.chat.invoke_stream():
                    if msg.role == AuthorRole.ASSISTANT:
                        if len(msg.items) > 0 and type(msg.items[0]) == StreamingTextContent:
                            if (msg.content == '<think>'):
                                is_thinking = True
                            if (msg.content == '</think>'):
                                is_thinking = False
                            if (msg.content != '') and not is_thinking:
                                if (current_agent != msg.name):
                                    prefix = msg.name + ": " if is_first_chunk else "\n" + msg.name + ": "
                                    pool.submit(self._send_stream_to_client, channel,
                                                { "message": prefix + msg.content, "stop": False })
                                    current_agent = msg.name
                                    is_first_chunk = False
                                else:
                                    pool.submit(self._send_stream_to_client, channel,
                                                { "message": msg.content, "stop": False })
                                await asyncio.sleep(0)

                future = pool.submit(self._send_stream_to_client, channel, { "message": "", "stop": True})
                future.result()
                pool.shutdown(wait=True)
        except Exception as e:
            try:
                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                    pool.submit(self._send_stream_to_client, channel, { "message": "", "stop": True})
                    future = pool.submit(self._send_stream_to_client, channel, { "message": "", "stop": True})
                    future.result()
                    pool.shutdown(wait=True)
            except Exception as e2:
                _logger.error(e2)
            _logger.error(e)
            return False

        return True

    def agent_chat(self, chitchat, channel, message, history):
        res = async_utils.run_async_function(self._stream_agent_chat, chitchat, channel, message, history)

        return res

    def group_chat(self, chitchat, channel, message):
        res = async_utils.run_async_function(self._stream_group_chat, chitchat, channel, message)

        return res
