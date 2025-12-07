# -*- coding: utf-8 -*-
from odoo import fields, models

class ActWindowView(models.Model):
    _inherit = 'ir.actions.act_window.view'

    view_mode = fields.Selection(selection_add=[
        ('hello', "Hello"),
        ('statistic', "Statistic"),
        ('cheat', "Cheat")
    ],  ondelete={'hello': 'cascade', 'statistic': 'cascade', 'cheat': 'cascade'})
