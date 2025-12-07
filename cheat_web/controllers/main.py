# -*- coding: utf-8 -*-
from odoo import http

class CheatWebController(http.Controller):

    @http.route('/cheat/webrpc', type='json', auth='user', website=True)
    def do_something(self):
        return { "result": "Ok" }

    @http.route('/cheat/webrpcwithparam', type='json', auth='user', website=True)
    def do_something_else(self, param1, param2):
        return {
                "result": "Ok",
                "param1": param1,
                "param2": param2
            }

    @http.route('/cheat/webrpc/<int:param1>/<string:param2>', type='json', auth='user', website=True)
    def do_something_with_route_param(self, param1, param2):
        return {
                "result": "Ok",
                "param1": param1,
                "param2": param2
            }
