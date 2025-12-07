# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
import logging

_logger = logging.getLogger(__name__)

class ResUser(models.Model):
    _inherit = 'res.partner'

    is_calendar_bot = fields.Boolean('Is Calendar Bot')

    def _compute_im_status(self):
        super(ResUser, self)._compute_im_status()
        calendar_bot_user_id = self.env['ir.model.data']._xmlid_to_res_id('calendar_bot.user_calendar_bot')
        for user in self.filtered(lambda u: u.id == calendar_bot_user_id):
            user.im_status = "online"