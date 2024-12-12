
import base64
import io

try:
    from werkzeug.utils import send_file
except ImportError:
    from odoo.tools._vendor.send_file import send_file

from odoo import http
from odoo.http import request, Response
from odoo.tools import file_path
from odoo.addons.web.controllers.binary import Binary
from odoo.tools.mimetypes import guess_mimetype

class ThemeBinary(Binary):
    @http.route(
        [
            '/web/binary/login_page_background_image',
            '/web/login_page_background_image',
            '/login_page_background_image.png',
        ], type='http', auth="none", cors="*"
    )
    def login_page_background_image(self, **kw):
        image_str, image_last_update = request.env['ir.config_parameter'].sudo().get_param_with_last_update('backend_theme_explorer.login_page_background_image')
        if image_str:
            imgname = 'logo'
            imgext = '.png'

            image_base64 = base64.b64decode(image_str)
            image_data = io.BytesIO(image_base64)
            mimetype = guess_mimetype(image_base64, default='image/png')
            imgext = '.' + mimetype.split('/')[1]
            if imgext == '.svg+xml':
                imgext = '.svg'
            response = send_file(
                image_data,
                request.httprequest.environ,
                download_name=imgname + imgext,
                mimetype=mimetype,
                last_modified=image_last_update,
                response_class=Response,
            )
        else:
            response = http.Stream.from_path(file_path('backend_theme_explorer/static/img/1x1.png')).get_response()
        return response

    @http.route(
        [
            '/web/binary/login_logo',
            '/web/login_logo',
            '/login_logo.png',
        ], type='http', auth="none", cors="*"
    )
    def login_page_logo(self, **kw):
        image_str, image_last_update = request.env['ir.config_parameter'].sudo().get_param_with_last_update('backend_theme_explorer.login_page_logo')
        if image_str:
            imgname = 'logo'
            imgext = '.png'

            image_base64 = base64.b64decode(image_str)
            image_data = io.BytesIO(image_base64)
            mimetype = guess_mimetype(image_base64, default='image/png')
            imgext = '.' + mimetype.split('/')[1]
            if imgext == '.svg+xml':
                imgext = '.svg'
            response = send_file(
                image_data,
                request.httprequest.environ,
                download_name=imgname + imgext,
                mimetype=mimetype,
                last_modified=image_last_update,
                response_class=Response,
            )
        else:
            response = http.Stream.from_path(file_path('backend_theme_explorer/static/img/1x1.png')).get_response()

        return response
