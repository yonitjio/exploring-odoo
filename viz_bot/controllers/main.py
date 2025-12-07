# -*- coding: utf-8 -*-

from odoo import http, _
from odoo.http import request
from odoo.exceptions import UserError
from odoo.tools.image import image_guess_size_from_field_name

class VizBotController(http.Controller):
    @http.route(['/viz_bot/image/<string:model>/<int:image_id>'], type='http', auth="public")
    def image(self, model, image_id):
        config_parameter = request.env["ir.config_parameter"].sudo()
        ai_server_address = str(config_parameter.get_param("viz_bot.ai_server_address"))
        if (request.httprequest.remote_addr == ai_server_address.split(":")[0]):
            record = request.env['ir.binary'].sudo()._find_record(res_model=model, res_id=image_id)
        else:
            record = request.env['ir.binary']._find_record(res_model=model, res_id=image_id)
        stream = request.env['ir.binary']._get_image_stream_from(record, "x_image")

        send_file_kwargs = {'max_age': None}

        res = stream.get_response(**send_file_kwargs)
        res.headers['Content-Security-Policy'] = "default-src 'none'"
        return res
