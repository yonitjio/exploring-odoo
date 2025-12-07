# -*- coding: utf-8 -*-
from odoo import api, fields, models
from odoo.exceptions import ValidationError

class Users(models.Model):
    _inherit = 'res.users.settings'

    quickboard_theme = fields.Char("Quickboard Theme", default="def")
    quickboard_start_date = fields.Char("Start Date")
    quickboard_end_date = fields.Char("End Date")

    @api.constrains("quickboard_start_date")
    def _validate_start_date(self):
        for rec in self:
            if rec.quickboard_start_date and rec.quickboard_start_date.strip() != "":
                dt = fields.Datetime.from_string(rec.quickboard_start_date)
                if not dt:
                    raise ValidationError(f"Invalid date.")
            else:
                rec.quickboard_start_date = None

    @api.constrains("quickboard_end_date")
    def _validate_end_date(self):
        for rec in self:
            if rec.quickboard_end_date and rec.quickboard_end_date.strip() != "":
                dt = fields.Datetime.from_string(rec.quickboard_end_date)
                if not dt:
                    raise ValidationError(f"Invalid date.")
            else:
                rec.quickboard_end_date = None