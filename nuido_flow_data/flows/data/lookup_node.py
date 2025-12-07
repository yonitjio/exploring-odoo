# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class LookupNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        lookup_field = self.definition["lookup_field"]
        value_field = self.definition["value_field"]
        domain = [(lookup_field, "=", params)]

        record = self.env[self.definition["model"]].search_read(domain, [value_field])
        if len(record) > 0:
            res = record[0][value_field]
        else:
            res = None

        return res
