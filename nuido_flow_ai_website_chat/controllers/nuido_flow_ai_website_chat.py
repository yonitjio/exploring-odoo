# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging
_logger = logging.getLogger(__name__)

import json
from urllib.request import urlopen, Request

from odoo import http
from odoo.http import request

class NuidoFlowAiWebsiteChatController(http.Controller):
    @http.route('/nuido/webchat', type='jsonrpc', auth='public', website=True)
    def ai_chat(self, token, channel, message, context):
        web_node_definition = request.website.guest_node_definition_id
        if not request.env.user.is_public:
            web_node_definition = request.website.logged_in_users_node_definition_id

        if web_node_definition:
            node_definition = request.env["nuido_flow.node.definition"].sudo().browse(web_node_definition.id)
            try:
                monitor_process = request.env['ir.config_parameter'].sudo().get_param("nuido_flow.monitor_process", False) == "True"

                context = {
                    "uid": request.env.uid,
                    "user": request.env.user,
                    "is_debug": request.env.user.has_group('base.group_no_one'),
                    "active_node_definition_id": node_definition.id,
                    "active_node_definition_uuid": node_definition.uuid,
                    "monitor_process": monitor_process,
                    "skip_monitor": False
                }

                node_definition.with_context(**context).run({
                        "chat_mode": "chat",
                        "token": token,
                        "channel": channel,
                        "message": message
                    })
            except:
                _logger.warning("Exception running flow.", exc_info=True)
                return False

            return True
        return False

    @http.route('/nuido/webchat/reset', type='jsonrpc', auth='public', website=True)
    def chat_reset(self, token):
        web_node_definition = request.website.guest_node_definition_id
        if not request.env.user.is_public:
            web_node_definition = request.website.logged_in_users_node_definition_id

        if web_node_definition:
            node_def = request.env["nuido_flow.node.definition"].sudo().browse(web_node_definition.id)
            chat_states = request.env["nuido_flow_ai_chat.chat.state"].sudo().search([
                ("user_id", "=", request.env.uid),
                ("node_def_id", "=", node_def.id),
            ])

            for cs in chat_states:
                cs.reset_states()

            return True
        return False

    @http.route('/nuido/webchat/status', type='jsonrpc', auth='public', website=True)
    def webchatstatus(self, websiteId):
        website = request.env["website"].sudo().search_read([("id", "=", websiteId)], [
            "guest_node_definition_id",
            "logged_in_users_node_definition_id"
        ])
        res = {
            "guest": False,
            "loggedIn": False
        }

        if len(website) > 0:
            res = {
                "guest": True if website[0]["guest_node_definition_id"] else False,
                "loggedIn": True if website[0]["logged_in_users_node_definition_id"] else False,
            }
        return res


    @http.route('/nuido/assets.<any(css,js):ext>', type='http', auth='public')
    def assets_embed(self, ext, **kwargs):
        if ext not in ('css', 'js'):
            raise request.not_found()

        bundle = 'nuido_flow_ai_website_chat.assets'
        asset = request.env["ir.qweb"]._get_asset_bundle(bundle)
        stream = request.env['ir.binary']._get_stream_from(getattr(asset, ext)())
        return stream.get_response()

    @http.route('/nuido/font-awesome', type='http', auth='none', cors="*")
    def fontawesome(self, **kwargs):
        return http.Stream.from_path('web/static/src/libs/fontawesome/fonts/fontawesome-webfont.woff2').get_response()

    @http.route('/nuido/odoo_ui_icons', type='http', auth='none', cors="*")
    def odoo_ui_icons(self, **kwargs):
        return http.Stream.from_path('web/static/lib/odoo_ui_icons/fonts/odoo_ui_icons.woff2').get_response()
