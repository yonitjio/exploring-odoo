# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import logging
_logger = logging.getLogger(__name__)

from odoo import models, fields

AI_CHAT_MESSAGE_TRIGGERS = [
    "ai_chat_message"
]

class NodeDefinition(models.Model):
    _inherit = "nuido_flow.node.definition"

    ai_chat_user_ids = fields.One2many(
        comodel_name='res.users',
        inverse_name='nuido_flow_ai_chat_node_definition_id',
        string='Users',
        domain="[('share','=', False)]"
    )

    is_ai_chat_flow = fields.Boolean("Flow for AI Chat", default=False)

    ai_chat_states = fields.One2many(
        comodel_name="nuido_flow_ai_chat.chat.state",
        inverse_name="node_def_id",
        string="Chat States"
    )

    def write(self, vals):
        if "raw" in vals:
            self.ai_chat_user_ids = False
            self.is_ai_chat_flow = False
        return super(NodeDefinition, self).write(vals)

    def _before_process_trigger_node(self, rec, trigger_definition, trigger_node):
        super()._before_process_trigger_node(rec, trigger_definition, trigger_node)

        if trigger_node.TRIGGER_METHOD_NAME in AI_CHAT_MESSAGE_TRIGGERS:
            rec.is_ai_chat_flow = True


