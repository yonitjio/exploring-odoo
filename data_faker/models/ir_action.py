"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""

from odoo import fields, models

class ActWindowView(models.Model):
    _inherit = 'ir.actions.act_window.view'

    view_mode = fields.Selection(selection_add=[
        ('faker', "Faker")
    ],  ondelete={'faker': 'cascade'})
