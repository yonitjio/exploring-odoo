"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
import json

from .base_node import BaseNode


class StartNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        parametersJson = {}
        if len(self.definition["parameters"]) > 0:
            parameters = self.definition["parameters"]
            parametersJson = json.loads(parameters)

        return params | parametersJson
