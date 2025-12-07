# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import random
from ..core.base_node import BaseNode

class RandomNumberNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        fr = self.definition["from"]
        to = self.definition["to"]
        res = random.randrange(fr, to)
        return {
            self.definition["key"]: res
        }
