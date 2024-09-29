# Do not forget to add this file to __init__.py
# Refer to https://www.odoo.com/documentation/17.0/contributing/development/coding_guidelines.html for coding guidelines


import random
import string

from odoo import _, fields, models, api

class BasicCheat(models.Model):
    _name = "cheat.basic"

    # Char field is usually displayed as a single-line string
    char_field = fields.Char(string="Char field", required=True)

    # Text field is usually displayed as a multi-line string
    text_field = fields.Text(string="Text field")

    # For more information about Odoo's ORM visit https://www.odoo.com/documentation/14.0/developer/reference/addons/orm.html
    boolean_field = fields.Boolean(string="Boolean field")

    selection_field = fields.Selection(string="Selection field", selection=[
            ("value1", "Item 1"),
            ("value2", "Item 2")
        ])

    # Computed field is computed by the method set on the compute parameter.
    # Computed fields are read-only by default, to be able to assign value to a computed field use inverse parameter.
    computed_field = fields.Boolean(string="Compute field", compute="_my_compute_field", store=True)


    # If a computed field uses value from other fields, specify those fields with depends
    @api.depends("boolean_field")
    def _my_compute_field(self):
        for rec in self:
            rec.computed_field = rec.boolean_field

    def _random_string(self):
        res = ''.join(random.choices(string.ascii_letters, k=10))
        return res

    def action_set_char_field_value(self):
        for rec in self:
            rec.char_field = _('Random string:') + str(self._random_string())
        return True
