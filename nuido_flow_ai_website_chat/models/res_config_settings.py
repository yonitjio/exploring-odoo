# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo import fields, models

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    guest_node_definition_id = fields.Many2one(related='website_id.guest_node_definition_id', readonly=False)
    logged_in_users_node_definition_id = fields.Many2one(related='website_id.logged_in_users_node_definition_id', readonly=False)
