# -*- coding: utf-8 -*-

from odoo import http, _
from odoo.http import request

class CalendarBotController(http.Controller):
    @http.route('/calendar_bot/query', type='json', auth='user')
    def query(self, thread_id, thread_model, author_id, query):
        AdvAiBot = request.env["mail.bot.calendar"]
        AdvAiBot.query(thread_id, thread_model, author_id, query)