"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""

import logging
from odoo.tools import safe_eval

from .base_node import BaseNode
from ..tools.tools import get_aux_node_def_by_role, run_nodes

_logger = logging.getLogger(__name__)


class ForLoopNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        start_value = self.definition["start_value"]
        end_value = self.definition["end_value"]
        step = self.definition["step"]

        loop_start_node_def = get_aux_node_def_by_role(self, "loop")
        loop_result = {}
        if loop_start_node_def:
            loop_params = {**params}
            for i in range(start_value, end_value, step):
                loop_params["loop_index"] = i

                loop_result = run_nodes(
                    self.env,
                    self.create_function_registry,
                    self.definitions,
                    loop_start_node_def,
                    loop_params
                )

        return loop_result