"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
from odoo.addons.n2.graph.tools.function_tool import create_object
from .base_node import BaseNode


class MergeNode(BaseNode):
    def _process(self, params):
        result = params
        for node_id in self.definition["aux_nodes"]:
            node_def = next(
                (o for o in self.definitions if o["id"] == node_id["id"]), None
            )
            if node_def:
                node: BaseNode | None = create_object(
                    self.env,
                    self.create_function_registry,
                    self.definitions,
                    node_def["type"],
                    node_def,
                )
                data = node.process(params)
                result = result | data

        return result
