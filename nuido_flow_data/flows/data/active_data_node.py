# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class ActiveDataNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        if ("active_ids" in self.env.context):
            domain = [("id", "in", self.env.context["active_ids"])]
            field_infos = self.definition["fields"]
            fields = [o["value"] for o in field_infos]

            data = self.env[self.env.context["active_model"]].search_read(domain, fields)

            return {
                    self.definition["key"]: data
                }
        else:
            return {
                    self.definition["key"]: []
                }
