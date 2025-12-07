# -*- coding: utf-8 -*-
from odoo import fields, models

class Users(models.Model):
    _inherit = 'res.users.settings'

    cheat_web_user_setting_char_field = fields.Char("User Char Field", default="default")
    cheat_web_user_setting_integer_field = fields.Integer("User Integer Field", default=0)
