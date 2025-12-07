# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

from odoo import fields, models

_logger = logging.getLogger(__name__)

class Website(models.Model):
    _inherit = 'website'

    guest_node_definition_id = fields.Many2one(
        string="Automation for Guest",
        comodel_name='nuido_flow.node.definition'
    )

    logged_in_users_node_definition_id = fields.Many2one(
        string="Automation for Logged in users",
        comodel_name='nuido_flow.node.definition'
    )
