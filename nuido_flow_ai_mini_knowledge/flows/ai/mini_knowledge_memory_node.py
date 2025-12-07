# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from odoo.addons.nuido_flow_ai.flows.ai.memory_utils import create_memory

from .const import COLLECTION_NAME

class MiniKnowledgeMemoryNode(BaseNode):
    def _process(self, params):
        res = create_memory(COLLECTION_NAME)
        return {
            "memory": res
        }
