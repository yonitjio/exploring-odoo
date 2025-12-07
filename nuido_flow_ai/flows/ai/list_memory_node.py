# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

from autogen_core.memory import ListMemory, MemoryContent, MemoryMimeType
from .utils import run_async_function

class ListMemoryNode(BaseNode):
    async def _build_memory(self):
        list_memory = ListMemory()

        memories = self.definition["memories"]

        for memory in memories:
            await list_memory.add(MemoryContent(content=memory, mime_type=MemoryMimeType.TEXT))

        return list_memory

    def _process(self, params):
        res = run_async_function(self._build_memory)

        return {
            "memory": res
        }
