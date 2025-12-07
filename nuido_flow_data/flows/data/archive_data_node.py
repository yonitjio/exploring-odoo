# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import logging

from typing import Sequence

from odoo.tools import safe_eval
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from odoo.addons.nuido_flow.flows.tools.tools import get_default_context_for_eval, get_active_record_info

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

class ArchiveDataNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        context = get_default_context_for_eval(self.env)
        if params is not None:
            context['params'] = params

        info = get_active_record_info(self.env)
        context = {**context, **info}

        ids_def = self.definition["ids"]
        try:
            ids = safe_eval.safe_eval(ids_def, context)
        except:
            _logger.warning("Exception on evaluation: %s", ids_def, exc_info=True)
            ids = []

        if not isinstance(ids, Sequence):
            ids = [ids]

        model = self.definition["model"]
        res = self.env[model]
        count = res.search_count([("id", "in", ids)])
        if count > 0:
            res = self.env[model].browse(ids)
            res.action_archive()

        return {
            "result": res
        }