# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

import logging
_logger = logging.getLogger(__name__)

import json

from semantic_kernel.contents.chat_history import ChatHistory

from odoo.addons.nuido_base.tools.function_tool import create_object
from ..models import registry_category as rcat

class ChitChat:
    def __init__(self, env, definition):
        self.mode = "None"

        self.env = env
        definitions = json.loads(definition)
        create_function_registry = self.env["nuido_base.registry"].search_read([("category", "=", rcat.CREATE_FUNCTION)])

        group_def = next((o for o in definitions if o["type"].endswith("Group")), None)

        if group_def is not None:
            chat_group = create_object(self.env, create_function_registry, definitions, group_def["type"], group_def)
            self.chat = chat_group

            self.mode = "group"
        else:
            agent_def = next((o for o in definitions if o["type"].endswith("Agent")), None)
            if agent_def is not None:

                self.chat_history = ChatHistory()

                agent = create_object(self.env, create_function_registry, definitions, agent_def["type"], agent_def)
                self.chat = agent

                self.mode = "agent"

