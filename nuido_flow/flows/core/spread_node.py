# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from .base_node import BaseNode
from ..tools.tools import run_nodes

class SpreadNode(BaseNode):
    def _process(self, params):
        if "next_nodes" in self.definition and len(self.definition["next_nodes"]) > 0:
            for loop_node_info in self.definition["next_nodes"]:
                node_def = next((o for o in self.definitions if o["id"] == loop_node_info["id"]), None)
                if node_def is not None:
                    run_nodes(self.env, self.create_function_registry, self.definitions, node_def, params)

        return params

    def get_next_node_info(self):
        return None
