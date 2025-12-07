# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo import models, fields

class ResUsers(models.Model):
    _inherit = "res.users"

    nuido_flow_ai_chat_node_definition_id = fields.Many2one(
        comodel_name='nuido_flow.node.definition',
        string='Nuido Node Definition for AI Chat'
    )

    nuido_flow_ai_chat_states = fields.One2many(
        comodel_name="nuido_flow_ai_chat.chat.state",
        inverse_name="user_id",
        string="Chat States"
    )
