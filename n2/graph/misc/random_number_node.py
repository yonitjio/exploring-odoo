"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
import random
from ..core.base_node import BaseNode


class RandomNumberNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        fr = self.definition["from"]
        to = self.definition["to"]
        res = random.randrange(fr, to)
        return {self.definition["key"]: res}
