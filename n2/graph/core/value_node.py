"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
import logging

from odoo.tools import safe_eval

from .base_node import BaseNode
from ..tools.tools import get_default_context_for_eval, get_active_record_info

_logger = logging.getLogger(__name__)

class ValueNode(BaseNode):
    def _process(self, params):
        context = get_default_context_for_eval(self.env)
        if params is not None:
            context["params"] = params

        info = get_active_record_info(self.env)
        context = {**context, **info}

        res = safe_eval.safe_eval(self.definition["value"], context)

        return res
