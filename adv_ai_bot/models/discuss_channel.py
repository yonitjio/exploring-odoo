# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

from .adv_ai_bot import AdvAiBot

class Channel(models.Model):
    _inherit = 'discuss.channel'

    adv_ai_bot_partner_id = fields.Many2one('res.partner', 'AI Bot', compute='_compute_adv_ai_bot_partner', store=False)
    adv_ai_bot_history_ids = fields.One2many(comodel_name="mail.bot.advai.message", inverse_name="channel_id")

    def _compute_adv_ai_bot_partner(self):
        for rec in self:
            rec.adv_ai_bot_partner_id = rec.mapped('channel_member_ids.partner_id').filtered('is_adv_ai_bot')

    def execute_command_clear_ai_chat(self, **kwargs):
        partner = self.env.user.partner_id
        key = kwargs['body']
        if key.lower().strip() == '/clear':
            if self.adv_ai_bot_partner_id:
                ai_chat_member_ids = {self.adv_ai_bot_partner_id.id, partner.id}
                if ai_chat_member_ids == set(self.mapped('channel_member_ids.partner_id.id')):
                    self.env['bus.bus']._sendone(self.env.user.partner_id, 'mail.message/delete',
                                                 {'message_ids': self.message_ids.ids})
                    self.message_ids.unlink()
                    self.adv_ai_bot_history_ids.unlink()
