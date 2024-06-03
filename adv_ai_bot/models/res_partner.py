# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
import logging

_logger = logging.getLogger(__name__)

class ResPartner(models.Model):
    _inherit = 'res.partner'

    is_adv_ai_bot = fields.Boolean('Is Adv AI Bot')

    def _compute_im_status(self):
        super(ResPartner, self)._compute_im_status()
        adv_ai_bot_partner_id = self.env['ir.model.data']._xmlid_to_res_id('adv_ai_bot.partner_adv_ai_bot')
        for partner in self.filtered(lambda u: u.id == adv_ai_bot_partner_id):
            partner.im_status = 'online'