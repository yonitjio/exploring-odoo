# Do not forget to add this file to __init__.py
# Refer to https://www.odoo.com/documentation/17.0/contributing/development/coding_guidelines.html for coding guidelines
#
# For more information about inheritance visit:
# https://www.odoo.com/documentation/17.0/developer/reference/backend/orm.html#inheritance-and-extension

import random
import string

from odoo import _, fields, models, api
from odoo.exceptions import ValidationError

# Class Inheritance:
# Used to add features
# New class compatible with existing views
# Stored in same table
class CheatChild(models.Model):
    _inherit = "cheat.basic"

    char_field = fields.Char(string="Char Field", required=False)
    float_field = fields.Float(string="Float Field")
    datetime_field = fields.Datetime(string="Datetime Field")

    is_delegation = fields.Boolean("Is delegation", compute="_is_delegation", store=True)
    delegation_ids = fields.One2many(comodel_name="cheat.child.delegation", inverse_name="cheat_basic_id")

    @api.depends("delegation_ids")
    def _is_delegation(self):
        for rec in self:
            if rec.delegation_ids:
                rec.is_delegation = True
            else:
                rec.is_delegation = False

    def _random_string(self):
        res = '(class):' + ''.join(random.choices(string.ascii_letters, k=10))
        return res

    def action_show_random_string(self):
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'type': 'danger', # valid values 'info', 'warning', 'danger'
                'title': _('This is a sticky notification'),
                'sticky': False,
                'message': self._random_string()
            },
        }

# Prototype Inheritance:
# Used to copy features
# New class is ignored by existing views
# Stored in different table
class CheatChildProto(models.Model):
    _name = "cheat.child.proto"
    _inherit = "cheat.basic"

    proto_date_field = fields.Date(string="Proto Date Field")

    def _random_string(self):
        res = '(proto):' + ''.join(random.choices(string.ascii_letters, k=10))
        return res

    def action_show_random_string(self):
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'type': 'danger', # valid values 'info', 'warning', 'danger'
                'title': _('This is a sticky notification'),
                'sticky': False,
                'message': self._random_string()
            },
        }

# Delegation Inheritance:
# Multiple inheritance is possible
# New class is ignored by existing views
# Stored in different table
# *WARNING* Methods are not inherited, only fields
# *WARNING* Delegation inheritance is more or less implemented, avoid it if you can
# *WARNING* Chained delegation inheritance is essentially not implemented
class CheatChildDelegation(models.Model):
    _name = "cheat.child.delegation"

    _inherits = {
        'cheat.basic': 'cheat_basic_id',
        'cheat.relation.auxiliary': 'cheat_relation_aux_id'
    }

    cheat_basic_id = fields.Many2one("cheat.basic", required=True, ondelete="cascade")
    cheat_relation_aux_id = fields.Many2one("cheat.relation.auxiliary", required=True, ondelete="cascade")