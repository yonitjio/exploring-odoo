"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""

import logging
from odoo.tools import safe_eval

from .base_node import BaseNode
from ..tools.tools import (
    get_active_record_info,
    get_default_context_for_eval,
    get_aux_node_def_by_role,
    run_nodes,
)

_logger = logging.getLogger(__name__)


class LoopNode(BaseNode):
    def _process(self, params):
        iterable_def = self.definition["iterable"]

        loop_start_node_def = get_aux_node_def_by_role(self, "loop")
        loop_result = {}
        if loop_start_node_def:
            context = get_default_context_for_eval(self.env)
            if params is not None:
                context["params"] = params

            info = get_active_record_info(self.env)
            context = {**context, **info}

            iterable = safe_eval.safe_eval(iterable_def, context)

            loop_params = {**params}
            for item in iterable:
                loop_params["iterable_item"] = item
                loop_result = run_nodes(
                    self.env,
                    self.create_function_registry,
                    self.definitions,
                    loop_start_node_def,
                    loop_params,
                )

        return loop_result