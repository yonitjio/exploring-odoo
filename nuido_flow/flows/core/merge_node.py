# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_base.tools.function_tool import create_object
from .base_node import BaseNode
from .base_node import FlowNode

class MergeNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        result = params
        for node_id in self.definition["aux_nodes"]:
            node_def = next((o for o in self.definitions if o["id"] == node_id["id"]), None)
            if node_def:
                node: FlowNode | None = create_object(self.env, self.create_function_registry, self.definitions, node_def["type"], node_def)
                data = node.process(params)
                result = result | data

        return result
