# -*- coding: utf-8 -*-

from odoo import http, _
from odoo.http import request

class AiBotController(http.Controller):
    @http.route('/ai_bot/query', type='json', auth='user')
    def query(self, thread_id, thread_model, thread_type, author_id, query):
        AiBot = request.env["mail.bot.ai"]
        AiBot.query(thread_id, thread_model, thread_type, author_id, query)