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

class ConditionalNode(BaseNode):
    def _process(self, params):
        context = get_default_context_for_eval(self.env)
        if params is not None:
            context["params"] = params

        info = get_active_record_info(self.env)
        context = {**context, **info}

        res = safe_eval.safe_eval(self.definition["condition"], context)

        if "next_nodes" in self.definition and len(self.definition["next_nodes"]) > 0:
            true_node = next(
                (
                    o
                    for o in self.definition["next_nodes"]
                    if o["data"]["condition"] == "True"
                ),
                None,
            )
            false_node = next(
                (
                    o
                    for o in self.definition["next_nodes"]
                    if o["data"]["condition"] == "False"
                ),
                None,
            )

            self.next_node_info = true_node if res else false_node
        else:
            self.next_node_info = None

        return params
