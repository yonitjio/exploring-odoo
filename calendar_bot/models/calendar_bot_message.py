# -*- coding: utf-8 -*-

import logging

from odoo import models, fields

_logger = logging.getLogger(__name__)


class CalendarBotMessage(models.Model):
    _name = 'mail.bot.calendar.message'
    _description = 'Calendar Bot Message History'

    channel_id = fields.Many2one("discuss.channel",
                                 string="Channel",
                                 required=True)
    message = fields.Text('Message')

