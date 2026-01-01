"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
import random
from ..core.base_node import BaseNode


class DummyNode(BaseNode):
    def _process(self, params):
        raise Exception("This is an exception")
