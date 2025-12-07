# Do not forget to add this file to __init__.py
# Refer to https://www.odoo.com/documentation/17.0/contributing/development/coding_guidelines.html for coding guidelines

import string
import random

from odoo import _, fields, models, api, Command

# Main model should be in it's own file
class MainModel(models.Model):
    _name = "cheat.relation.main"

    main_char_field = fields.Char(string="Main Char Field", required=True)
    main_text_field = fields.Text(string="Main Text Field")

    # For more information about Odoo ORM go to https://www.odoo.com/documentation/17.0/developer/reference/backend/orm.html
    # One2Many field REQUIRES the corresponding field on the other model
    main_one_to_many_ids = fields.One2many(comodel_name="cheat.relation.line", inverse_name="line_many_to_one_id", string="Line Model")
    main_many_to_many_ids = fields.Many2many(comodel_name="cheat.relation.auxiliary", string="Auxiliary Model")

    def _random_string(self):
        res = ''.join(random.choices(string.ascii_letters, k=10))
        return res

    # Internally, each command is a 3-elements tuple where the first element is a mandatory integer that identifies the command,
    # the second element is either the related record id to apply the command on (commands update, delete, unlink and link)
    # either 0 (commands create, clear and set), the third element is either the values to write on the record
    # (commands create and update) either the new ids list of related records (command set),
    # either 0 (commands delete, unlink, link, and clear).
    def action_add_lines(self):
        self.ensure_one()
        self.main_one_to_many_ids = [
            Command.clear(),
            Command.create({
                'line_char_field': _('Random string:') + str(self._random_string()),
                'line_int_field': random.randint(1, 100)
            }),
            Command.create({
                'line_char_field': _('Random string:') + str(self._random_string()),
                'line_int_field': random.randint(1, 100)
            }),
            Command.create({
                'line_char_field': _('Random string:') + str(self._random_string()),
                'line_int_field': random.randint(1, 100)
            }),
        ]

    def action_clear_lines(self):
        self.ensure_one()
        self.main_one_to_many_ids = [
            Command.clear()
        ]

    def action_random_update(self):
        self.ensure_one()
        if len(self.main_one_to_many_ids) > 0:
            self.main_one_to_many_ids = [
                Command.update(rec, {
                    'line_char_field': _('Random string:') + str(self._random_string()),
                    'line_int_field': random.randint(1, 100)
                }) for rec in self.main_one_to_many_ids.ids
            ]

    @api.model
    def generate_auxs(self):
        self.env["cheat.relation.auxiliary"].create({
            'auxiliary_char_field': _('Random string:') + str(self._random_string())
        })
        cnt = self.env["cheat.relation.auxiliary"].search_count([])

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'type': 'info', # valid values 'info', 'warning', 'danger'
                'title': _('Info'),
                'sticky': False,
                'message': _('Auxiliary count: ' + str(cnt)),
            },
        }


# If the line (details) model contains complex logic or other codes, consider make a separate file for it.
class LineModel(models.Model):
    _name = "cheat.relation.line"

    line_char_field = fields.Char(string="Line Char Field", required=True)
    line_int_field = fields.Integer(string="Line Char Field", default=0)
    line_computed_field = fields.Char(string="Computed Field", compute="_my_computed_field")

    line_many_to_one_id = fields.Many2one(comodel_name="cheat.relation.main", string="Main Model", ondelete="cascade")

    def _my_computed_field(self):
        for rec in self:
            rec.line_computed_field = random.choice(["confirmed", "new"])

# Models should be in their own separated files
class AuxiliaryModel(models.Model):
    _name = "cheat.relation.auxiliary"


    auxiliary_char_field = fields.Char(string="Auxiliary Char Field", required=True)

    _sql_constraints = [
        ('uniq_aux_char_field', 'unique(auxiliary_char_field)', 'The char field must be unique.'),
    ]
