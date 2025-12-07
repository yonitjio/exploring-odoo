# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo.api import Environment
from odoo.modules.registry import Registry

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class AiChatResponderNode(BaseNode):
    def _send_stream_to_client(self, uid, channel, content):
        try:
            with Registry(self.env.cr.dbname).cursor() as cr:
                my_env = Environment(cr, uid, self.env.context)
                my_env.user._bus_send(channel, content)

            return True
        except:
            return False


    def _process(self, params):
        super()._process(params)
        channel = self.env.context["run_params"]["channel"]
        uid = self.env.context["uid"]
        self._send_stream_to_client(uid, channel, params)
        return params