# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import logging

_logger = logging.getLogger(__name__)

from werkzeug.exceptions import Unauthorized
from odoo.http import request, route, Controller

# adapted from base_automation module
def get_webhook_request_payload():
    if not request:
        return None
    try:
        payload = request.get_json_data()
    except ValueError:
        _logger.warning("Exception on reading request data.", exc_info=True)
        payload = {**request.httprequest.args}
    return payload

class NuidoWebhookController(Controller):
    @route(['/nuido/webhook/<string:hook_id>'], type='http', auth='public', methods=['POST'], csrf=False, save_session=False)
    def nuido_webhook(self, hook_id, **kwargs):
        """ Execute an automation webhook """
        node_definition = request.env['nuido_flow.node.definition'].sudo().search([('trigger_webhook_id', '=', hook_id)])
        if not node_definition:
            return request.make_json_response({'status': 'error'}, status=404)

        payload = get_webhook_request_payload()
        try:
            context = {
                "uid": node_definition.create_uid.id,
                "user": node_definition.create_uid,
                "is_debug": node_definition.create_uid.has_group('base.group_no_one'),
                "active_node_definition_id": node_definition.id,
                "active_node_definition_uuid": node_definition.uuid,
                "payload": payload
            }

            node_definition.with_context(**context).run(payload)
        except Unauthorized:
            _logger.warning("Unauthorized access.", exc_info=True)
            # return request.make_json_response({'status': 'error'}, status=401)
            raise
        except:
            _logger.warning("Exception running flow.", exc_info=True)
            # return request.make_json_response({'status': 'error'}, status=500)
            raise
        return request.make_json_response({'status': 'ok'}, status=200)
