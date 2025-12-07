# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo import fields
from odoo.tools import date_utils as dtu
from odoo.tools.misc import format_date as odoo_format_date

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class SalesSummaryOdooNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        summary_type = self.definition["summary_type"]
        date_start = dtu.start_of(fields.Datetime.now(), granularity=summary_type)
        date_end = dtu.end_of(fields.Datetime.now(), granularity=summary_type)

        domain = [
            ("date", ">=", date_start),
            ("date", "<", date_end)
        ]
        res = []
        aggs = self.env["sale.report"]._read_group(domain, groupby=["name", "date:day", "partner_id"], aggregates=["price_total:sum"])
        for agg in aggs:
            res.append({
                    "name": agg[0],
                    "date": odoo_format_date(self.env, agg[1]) ,
                    "customer": agg[2].name,
                    "total": agg[3]
                })

        return {
                "start_date": date_start,
                "end_date": date_end,
                "value": res
            }
