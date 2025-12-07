# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo import fields, models

from odoo import _, fields, models, api

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    mini_knowledge_summarizer_node_definition_id = fields.Many2one(
        comodel_name="nuido_flow.node.definition",
        string="Summarizer",
        config_parameter="nuido_flow_ai_mini_knowledge.mini_knowledge_summarizer_node_definition_id"
    )
