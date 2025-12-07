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

class HttpHeaderNode(BaseNode):
    def _process(self, params) -> any:
        super()._process(params)

        context = get_default_context_for_eval(self.env)
        if params is not None:
            context['params'] = params

        info = get_active_record_info(self.env)
        context = {**context, **info}
        res = {}

        try:
            for h in self.definition["http_headers"]:
                value = safe_eval.safe_eval(h["value"], context)
                res.update({
                        h["name"]: value
                    })
        except:
            _logger.warning("Exception evaluating header value.", exc_info=True)

        return res
