# -*- coding: utf-8 -*-

import logging
_logger = logging.getLogger(__name__)

from markupsafe import Markup
from odoo import models, api
from werkzeug.exceptions import NotFound

from .calendar_bot import CalendarBot

import markdown
from markupsafe import Markup

class MailBotCalendar(models.AbstractModel):
    _name = 'mail.bot.calendar'
    _description = 'Calendar Bot'

    @api.model
    def query(self, thread_id, thread_model, author_id, query):
        thread = self.env[thread_model].browse(thread_id)
        if not thread:
            raise NotFound()

        calendar_bot_partner_id = self.env["ir.model.data"]._xmlid_to_res_id("calendar_bot.partner_calendar_bot")

        if (
            len(thread) != 1
            or author_id == calendar_bot_partner_id
        ):
            return

        if not self._is_in_private_channel(thread):
            return

        calendar_bot = CalendarBot(self.env)
        answer = calendar_bot.query(thread, author_id, query)

        reply_message_type = "comment"
        subtype_id = self.env["ir.model.data"]._xmlid_to_res_id("mail.mt_comment")
        discuss_channel = thread.with_context(mail_create_nosubscribe=True).sudo()
        answer_md = markdown.markdown(answer, extensions=['markdown.extensions.sane_lists'])
        answer_body = Markup(answer_md)
        return discuss_channel.message_post(
            body=answer_body,
            author_id=calendar_bot_partner_id,
            message_type=reply_message_type,
            subtype_id=subtype_id,
        )

    def _is_in_private_channel(self, discuss_channel):
        calendar_bot_partner_id = self.env["ir.model.data"]._xmlid_to_res_id("calendar_bot.partner_calendar_bot")
        if (
            discuss_channel._name == "discuss.channel"
            and discuss_channel.channel_type == "chat"
        ):
            return (
                calendar_bot_partner_id
                in discuss_channel.with_context(
                    active_test=False
                ).channel_partner_ids.ids
            )
        return False
