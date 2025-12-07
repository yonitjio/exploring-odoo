# -*- coding: utf-8 -*-

import logging
_logger = logging.getLogger(__name__)

from markupsafe import Markup
from odoo import models, api
from werkzeug.exceptions import NotFound

from .adv_ai_bot import AdvAiBot

import markdown
from markupsafe import Markup

class MailBotAdvAi(models.AbstractModel):
    _name = 'mail.bot.advai'
    _description = 'Adv AI Bot'

    @api.model
    def query(self, thread_id, thread_model, author_id, query):
        thread = self.env[thread_model].browse(thread_id)
        if not thread:
            raise NotFound()

        adv_ai_bot_partner_id = self.env["ir.model.data"]._xmlid_to_res_id("adv_ai_bot.partner_adv_ai_bot")

        if (
            len(thread) != 1
            or author_id == adv_ai_bot_partner_id
        ):
            return

        if not self._is_in_private_channel(thread):
            return

        adv_ai_bot = AdvAiBot(self.env)
        answer = adv_ai_bot.query(thread, author_id, query)

        reply_message_type = "comment"
        subtype_id = self.env["ir.model.data"]._xmlid_to_res_id("mail.mt_comment")
        discuss_channel = thread.with_context(mail_create_nosubscribe=True).sudo()
        return discuss_channel.message_post(
            body=Markup(markdown.markdown(answer, extensions=['sane_lists'])),
            author_id=adv_ai_bot_partner_id,
            message_type=reply_message_type,
            subtype_id=subtype_id,
        )

    def _is_in_private_channel(self, discuss_channel):
        adv_ai_bot_partner_id = self.env["ir.model.data"]._xmlid_to_res_id("adv_ai_bot.partner_adv_ai_bot")
        if (
            discuss_channel._name == "discuss.channel"
            and discuss_channel.channel_type == "chat"
        ):
            return (
                adv_ai_bot_partner_id
                in discuss_channel.with_context(
                    active_test=False
                ).channel_partner_ids.ids
            )
        return False
