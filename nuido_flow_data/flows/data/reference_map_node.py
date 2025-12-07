# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

from odoo.tools import safe_eval

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from odoo.addons.nuido_flow.flows.tools.tools import get_default_context_for_eval, get_active_record_info

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

class ReferenceMapNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        context = get_default_context_for_eval(self.env)
        if params is not None:
            context['params'] = params

        info = get_active_record_info(self.env)
        context = {**context, **info}

        reference = self.definition["reference"]

        try:
            reference_value = safe_eval.safe_eval(reference, context)
        except:
            _logger.warning("Exception on evaluation: %s", reference, exc_info=True)
            reference_value = -1

        model = self.definition["model"]
        field = self.definition["field"]
        domain = [(field, "=", reference_value)]

        record = self.env[model].search_read(domain, ["id"])
        if len(record) == 0:
            res = -1
        else:
            res = record[0]

        return {
            "result": res
        }
