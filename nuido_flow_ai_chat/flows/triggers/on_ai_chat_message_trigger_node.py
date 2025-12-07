# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class OnAiChatMessageTriggerNode(BaseNode):
    TRIGGER_METHOD_NAME = "ai_chat_message"

    def _process(self, params):
        return super()._process(params)

    def cleanup(self):
        pass
