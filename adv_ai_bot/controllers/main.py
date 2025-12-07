# -*- coding: utf-8 -*-

from odoo import http, _
from odoo.http import request

class AdvAiBotController(http.Controller):
    @http.route('/adv_ai_bot/query', type='json', auth='user')
    def query(self, thread_id, thread_model, author_id, query):
        AdvAiBot = request.env["mail.bot.advai"]
        AdvAiBot.query(thread_id, thread_model, author_id, query)