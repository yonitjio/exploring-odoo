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

class NuidoAiController(http.Controller):
    '''Controller for running Nuido AI flow definitions. '''

    @http.route('/nuidoflow/run', type='json', auth='user', website=True)
    def run(self, def_id):
        '''
            Run a Nuido Flow definition.
            Params def_id:
                The ID of the Nuido Flow definition to run.
            Returns:
                True if the flow was successfully processed.
        '''
        try:
            env = request.env

            node_definition = env["nuido_flow.node.definition"].browse(def_id)
            if not node_definition.is_processed:
                node_definition._process_node_definitions()

            monitor_process = env['ir.config_parameter'].get_param("nuido_flow.monitor_process", False) == "True"

            context = {
                "uid": env.user.id,
                "user": env.user,
                "is_debug": env.user.has_group('base.group_no_one'),
                "active_node_definition_id": def_id,
                "active_node_definition_uuid": node_definition.uuid,
                "monitor_process": monitor_process,
                "skip_monitor": False
            }

            node_definition.with_context(**context).run({})
        except Exception:
            _logger.error("Error running Nuido Flow definition", exc_info=True)
            return False

        return True

    @http.route('/nuidoflow/process', type='json', auth='user', website=True)
    def process(self, def_id):
        '''
            Process a Nuido Flow definition.
            This method processes the flow definition.

            Parameters:
                def_id (int): The ID of the Nuido Flow definition to process.
            Returns:
                bool: True if the flow definition was processed successfully, False otherwise.
        '''
        try:
            env = request.env

            node_definition = env["nuido_flow.node.definition"].browse(def_id)
            if not node_definition.is_processed:
                node_definition.with_context(skip_monitor=True)._process_node_definitions()
        except Exception as ex:
            _logger.error("Error processing Nuido Flow definition", exc_info=True)
            return False

        return True
