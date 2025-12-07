# -*- coding: utf-8 -*-

import logging
_logger = logging.getLogger(__name__)

from markupsafe import Markup
from odoo import models, api
from werkzeug.exceptions import NotFound

from .ai.odoo_ai import OdooAI

class AiBot(models.AbstractModel):
    _name = 'mail.bot.ai'
    _description = 'AI Bot'

    @api.model
    def query(self, thread_id, thread_model, thread_type, author_id, query):
        thread = self.env[thread_model].browse(thread_id)
        if not thread:
            raise NotFound()

        ai_bot_channel = self.env.ref('ai_bot.channel_ai_bot')
        ai_bot_user = self.env.ref("ai_bot.user_ai_bot")
        ai_bot_partner = self.env.ref("ai_bot.partner_ai_bot")

        msg_author = author_id
        msg_body = query

        if (author_id != ai_bot_partner.id
                and ai_bot_partner.name in thread.display_name
                and thread_type == 'chat') \
            or \
            (author_id != ai_bot_partner.id
             and ai_bot_channel.display_name == thread.display_name
             and ('@' + ai_bot_partner.name) in query
             and thread_type == 'channel'):

            _logger.info("Received: %s %s %s %s %s", ai_bot_channel, ai_bot_user, ai_bot_partner, msg_author, msg_body)

            oai = OdooAI(self.env)
            answer = oai.query(str(msg_body))

            fanswer = ""
            # if "prompt" in answer:
            #     fanswer += f'Prompt: {Markup.escape(answer["prompt"])}<br/>'
            # if "topic" in answer:
            #     fanswer += f'Topic: {Markup.escape(answer["topic"])}<br/>'
            # if "text" in answer:
            #     fanswer += f'Text: {Markup.escape(answer["text"])}<br/>'
            # if "sql" in answer:
            #     fanswer += f'SQL: {Markup.escape(answer["sql"])}<br/>'
            # if "data" in answer:
            #     fanswer += f'SQL Result: {Markup.escape(answer["data"])}<br/>'
            # if "synth" in answer:
            #     fanswer += f'Synthesized: {Markup.escape(answer["synth"])}<br/>'
            # if "error" in answer:
            #     fanswer += f'Error: {Markup.escape(answer["error"])}<br/>'

            _logger.info(answer)

            if "synth" in answer:
                fanswer = answer["synth"]
            elif "topic" in answer and answer["topic"] == "other":
                fanswer = answer["text"]
            else:
                fanswer = "I'm sorry, but I can't help with your question."

            fanswer = Markup(fanswer)

            message_type = 'comment'
            subtype_id = self.env['ir.model.data']._xmlid_to_res_id('mail.mt_comment')
            thread.with_user(ai_bot_user).message_post(
                    body=fanswer,
                    author_id=ai_bot_partner.id,
                    message_type=message_type,
                    subtype_id=subtype_id
                )

    def _register_hook(self):
        OdooAI(self.env)
        return super()._register_hook()
