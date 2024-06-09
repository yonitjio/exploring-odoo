# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
import logging

_logger = logging.getLogger(__name__)

class ResPartner(models.Model):
    _inherit = 'res.partner'

    is_calendar_bot = fields.Boolean('Is Calendar Bot')

    def _compute_im_status(self):
        super(ResPartner, self)._compute_im_status()
        calendar_bot_partner_id = self.env['ir.model.data']._xmlid_to_res_id('calendar_bot.partner_calendar_bot')
        for partner in self.filtered(lambda u: u.id == calendar_bot_partner_id):
            partner.im_status = 'online'