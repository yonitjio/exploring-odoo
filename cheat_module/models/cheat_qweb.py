# Do not forget to add this file to __init__.py
# Refer to https://www.odoo.com/documentation/17.0/contributing/development/coding_guidelines.html for coding guidelines


import random
import string

from odoo import _, fields, models, api
from odoo.exceptions import ValidationError

class CheatQweb(models.Model):
    _name = "cheat.qweb"

    char_field = fields.Char(string="Char Field", required=True)
    boolean_field = fields.Boolean(string="Boolean Field")
