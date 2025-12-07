# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import logging

_logger = logging.getLogger(__name__)

from odoo import http
from odoo.http import request

class NuidoFlowAiChatController(http.Controller):
    @http.route('/nuido/chat', type='jsonrpc', auth='user', website=True)
    def chat(self, token, channel, message):
        node_definition = request.env.user.nuido_flow_ai_chat_node_definition_id
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


    @http.route('/nuido/chat/test', type='jsonrpc', auth='user', website=True)
    def chat_test(self, node_def_id, token, channel, message):
        node_def = request.env['nuido_flow.node.definition'].sudo().search([('id', '=', node_def_id)])
        if not node_def:
            _logger.warning("Flow definition is not found.")
            return False

        try:
            monitor_process = request.env['ir.config_parameter'].sudo().get_param("nuido_flow.monitor_process", False) == "True"

            context = {
                "uid": request.env.uid,
                "user": request.env.user,
                "is_debug": request.env.user.has_group('base.group_no_one'),
                "active_node_definition_id": node_def_id,
                "active_node_definition_uuid": node_def.uuid,
                "monitor_process": monitor_process,
                "skip_monitor": False
            }

            node_def.with_context(**context).run({
                    "chat_mode": "test",
                    "token": token,
                    "channel": channel,
                    "message": message
                })
        except:
            _logger.warning("Exception running flow.", exc_info=True)
            return False
        return True

    @http.route('/nuido/chat/test/reset', type='jsonrpc', auth='user', website=True)
    def chat_test_reset(self, node_def_id, token):
        node_def = request.env['nuido_flow.node.definition'].sudo().search([('id', '=', node_def_id)])
        if not node_def:
            _logger.warning("Flow definition is not found.")
            return False

        chat_states = request.env["nuido_flow_ai_chat.chat.state"].sudo().search([
            ("user_id", "=", request.env.uid),
            ("node_def_id", "=", node_def.id),
        ])

        for cs in chat_states:
            cs.reset_states()

        return True

    @http.route('/nuido/chat/reset', type='jsonrpc', auth='user', website=True)
    def chat_reset(self, token):
        env = request.env
        node_def = env.user.nuido_flow_ai_chat_node_definition_id
        chat_states = request.env["nuido_flow_ai_chat.chat.state"].sudo().search([
            ("user_id", "=", request.env.uid),
            ("node_def_id", "=", node_def.id),
        ])

        for cs in chat_states:
            cs.reset_states()

        return True
