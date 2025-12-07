# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from typing import Annotated
from semantic_kernel.functions.kernel_function_decorator import kernel_function

from odoo import fields
from odoo.api import Environment
from odoo.tools import DEFAULT_SERVER_DATE_FORMAT as DATE_FORMAT, date_utils as dtu
from odoo.tools.misc import format_date as odoo_format_date

class SalesPlugin:
    def __init__(self, env: Environment) -> None:
        self.env = env

    @kernel_function(description="Provides sales data from specified date range.")
    def get_sales(self,
            start_date: Annotated[str, f"Inclusive start date in with format: '{DATE_FORMAT}'"],
            end_date: Annotated[str, f"Exclusive end date in with format: '{DATE_FORMAT}'"],
        ) -> Annotated[any, "An array of sales data."]:
        domain = [
            ("date", ">=", start_date),
            ("date", "<", end_date)
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
        return res

    @kernel_function(description="Provides current week sales data.")
    def get_current_week_sales(self) -> Annotated[any, "An array of sales data."]:
        today = fields.Date.today()
        start = dtu.start_of(today, "week")
        end = dtu.end_of(today, "week")
        res = self.get_sales(start, end)
        return res

    @kernel_function(description="Provides current month sales data.")
    def get_current_month_sales(self) -> Annotated[any, "An array of sales data."]:
        today = fields.Date.today()
        start = dtu.start_of(today, "month")
        end = dtu.end_of(today, "month")
        res = self.get_sales(start, end)
        return res
