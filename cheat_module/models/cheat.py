# Do not forget to add this file to __init__.py
# Refer to https://www.odoo.com/documentation/17.0/contributing/development/coding_guidelines.html for coding guidelines


import random
import string

from odoo import _, fields, models, api
from odoo.exceptions import ValidationError

class BasicCheat(models.Model):
    _name = "cheat.basic"

    # Char field is usually displayed as a single-line string
    char_field = fields.Char(string="Char Field", required=True)

    # Text field is usually displayed as a multi-line string
    text_field = fields.Text(string="Text Field")

    # For more information about Odoo's ORM visit https://www.odoo.com/documentation/14.0/developer/reference/addons/orm.html
    boolean_field = fields.Boolean(string="Boolean Field")

    selection_field = fields.Selection(string="Selection Field", selection=[
            ("value1", "Item 1"),
            ("value2", "Item 2")
        ])

    # Computed field is computed by the method set on the compute parameter.
    # Computed fields are read-only by default, to be able to assign value to a computed field use inverse parameter.
    computed_field = fields.Boolean(string="Compute Field", compute="_my_computed_field", store=True)


    # If a computed field uses value from other fields, specify those fields with depends
    @api.depends("boolean_field")
    def _my_computed_field(self):
        for rec in self:
            rec.computed_field = rec.boolean_field

    def _random_string(self):
        res = ''.join(random.choices(string.ascii_letters, k=10))
        return res

    # Called by action button to set random string to char_field
    def action_set_char_field_value(self):
        for rec in self:
            rec.char_field = _('Random string:') + str(self._random_string())
        return True

    # Called by action button to show sticky notification
    def action_show_sticky_notification(self):
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'type': 'danger', # valid values 'info', 'warning', 'danger'
                'title': _('This is a sticky notification'),
                'sticky': True,
                'message': _('This is the message'),
                'next': {'type': 'ir.actions.act_window_close'},
            },
        }

    # Called by action button to show rainbow man
    def action_show_rainbow_man(self):
        return {
            'effect': {
                'fadeout': 'slow',
                'message': _('This is a rainbow'),
                'type': 'rainbow_man',
            }
        }

    # Called by action button to do nothing
    def action_do_nothing(self):
        return True

    # Called by action button to raise error
    def action_raise_error(self):
        # see odoo\odoo\exceptions.py for more built-in user exceptions
        raise ValidationError("This is a raised error")

    # Called by close button on the dialog with template
    def action_close_and_save(self):
        return {'type': 'ir.actions.act_window_close'}

    # Called by action button to dialog with template
    def action_show_view_in_a_dialog(self):
        # Target values:
        # 'new' -> dialog box,
        # 'current' -> main area,
        # 'fullscreen' -> fullscreen,
        # 'main' -> like current but clear the breadcrumb.
        return {
            'type': 'ir.actions.act_window',
            'target': 'new',
            'name': 'Templated Dialog',
            'view_id': self.env.ref('cheat_module.cheat_dialog_template_view').id,
            'view_mode': 'form',
            'res_model': 'cheat.basic',
            'res_id': self.id, # if omitted, Odoo will create new record everytime.
        }

    # Called by action button to show a wizard
    def action_show_wizard(self):
        # Don't include res_id key for wizards.
        return {
            'type': 'ir.actions.act_window',
            'target': 'new',
            'name': 'A wizard',
            'view_id': self.env.ref('cheat_module.cheat_wizard_view').id,
            'view_mode': 'form',
            'res_model': 'cheat.wizard',
        }
