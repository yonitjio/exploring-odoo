# -*- coding: utf-8 -*-

from datetime import date
from odoo import api, fields, models, _
from odoo.exceptions import UserError


class GeminiDashboard(models.TransientModel):
    _name = 'gemini.dashboard'
    _description = 'Gemini Dashboard'

    text = fields.Char(string="Text response")