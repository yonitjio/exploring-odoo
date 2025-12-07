# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

from .base_node import BaseNode
from ..tools.tools import get_default_context_for_eval, get_active_record_info

from odoo.tools import safe_eval

from ..tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

class ConditionalNode(BaseNode):
    def _process(self, params):
        context = get_default_context_for_eval(self.env)
        if params is not None:
            context['params'] = params

        info = get_active_record_info(self.env)
        context = {**context, **info}

        try:
            res = safe_eval.safe_eval(self.definition["condition"], context)
        except:
            _logger.warning("Exception on evaluation: %s", self.definition["condition"], exc_info=True)
            res = False

        if res != True:
            res = False

        if "next_nodes" in self.definition and len(self.definition["next_nodes"]) > 0:
            true_node = next((o for o in self.definition["next_nodes"] if o["spec"]["condition"] == 'True'), None)
            false_node = next((o for o in self.definition["next_nodes"] if o["spec"]["condition"] == 'False'), None)

            self.next_node_info = true_node if res else false_node
        else:
            self.next_node_info = None

        return params
