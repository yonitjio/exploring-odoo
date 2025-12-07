# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo import models, fields

class AiChatState(models.Model):
    _name = "nuido_flow_ai_chat.chat.state"
    _description = "AI chat state"

    token = fields.Char("Token")
    user_id = fields.Many2one(comodel_name="res.users", string="User")
    node_def_id = fields.Many2one(comodel_name="nuido_flow.node.definition", string="Node Definition")
    node_id = fields.Char("Node Id")
    test_state = fields.Text("Test Chat State", default="")
    chat_state = fields.Text("Chat State", default="")

    def reset_states(self):
        self.ensure_one()
        self.test_state = ""
        self.chat_state = ""
