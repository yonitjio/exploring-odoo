# Do not forget to add this file to __init__.py
# Refer to https://www.odoo.com/documentation/17.0/contributing/development/coding_guidelines.html for coding guidelines

from odoo import _, fields, models, api
from odoo.exceptions import ValidationError

class CheatWizard(models.TransientModel):
    _name = "cheat.wizard"

    # Char field is usually displayed as a single-line string
    char_field = fields.Char(string="Char field", required=True)

    # Called by action button to show sticky notification
    def action_do_something(self):
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'type': 'danger', # valid values 'info', 'warning', 'danger'
                'title': _('This is a sticky notification'),
                'sticky': False,
                'message': _(f'This is the value you entered: {self.char_field}'),
                'next': {'type': 'ir.actions.act_window_close'},
            },
        }
