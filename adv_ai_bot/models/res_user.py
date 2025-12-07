# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
import logging

_logger = logging.getLogger(__name__)

class ResUser(models.Model):
    _inherit = 'res.partner'

    is_adv_ai_bot = fields.Boolean('Is Adv AI Bot')

    def _compute_im_status(self):
        super(ResUser, self)._compute_im_status()
        adv_ai_bot_user_id = self.env['ir.model.data']._xmlid_to_res_id('adv_ai_bot.user_adv_ai_bot')
        for user in self.filtered(lambda u: u.id == adv_ai_bot_user_id):
            user.im_status = "online"