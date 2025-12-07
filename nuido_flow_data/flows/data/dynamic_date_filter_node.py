# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo import fields as fds
from odoo.tools import date_utils as dtu

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class DynamicDateFilterNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        domain = []
        dynamic_date_field = self.definition["dynamic_date_field"]
        dynamic_date_interval = self.definition["dynamic_date_interval"]

        if dynamic_date_field != "" and dynamic_date_interval != "":
            now = fds.Datetime.today()
            dynamic_domain = [(dynamic_date_field, ">=" , dtu.start_of(now, dynamic_date_interval)),
                            (dynamic_date_field, "<=", dtu.end_of(now, dynamic_date_interval))]

            domain = domain + dynamic_domain

        return {
            "filter": domain
        }
