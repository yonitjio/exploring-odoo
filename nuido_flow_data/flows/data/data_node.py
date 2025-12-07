# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import ast

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

from .tools import get_data_filter_nodes

class DataNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        additional_domain = []
        if ("domain" in params):
            additional_domain = params["domain"]

        domain = ast.literal_eval(self.definition["domain"])
        domain = domain + additional_domain

        filter_nodes = get_data_filter_nodes(self)
        for node in filter_nodes:
            filter_domain = node.process({})
            domain = domain + filter_domain["filter"]

        field_infos = self.definition["fields"]
        fields = [o["value"] for o in field_infos]

        data = self.env[self.definition["model"]].search_read(domain, fields)

        return {
                self.definition["key"]: data
            }
