# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request

from ..ai.ai_bot import AiBot

class AiDocController(http.Controller):
    @http.route('/ai_doc/chat', type='json', auth='user', website=True)
    def get_quickboard_item(self, message, history, streaming):
        env = request.env
        bot = AiBot(env)
        res = bot.chat(message, history, streaming)
        return res
