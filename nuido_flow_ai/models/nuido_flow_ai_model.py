# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo import models, fields

class NodeDefinition(models.Model):
    _name = "nuido_flow_ai.model"
    _description = "Nuido Flow AI available model"
    _order = "sequence"

    sequence = fields.Integer("Sequence", default=10)
    model_name = fields.Char("Model Name", required=True)
    model_description = fields.Text("Description")
