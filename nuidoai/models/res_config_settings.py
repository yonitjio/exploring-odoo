# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo import fields, models

class ResCompany(models.Model):
    _inherit =  'res.company'

    node_definition = fields.Many2one(string='Node Definition', comodel_name='nuidoai.node.definition', domain=[('is_processed', '=', True)])


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    node_definition = fields.Many2one(related='company_id.node_definition', readonly=False)
