# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from typing import Annotated

from zoneinfo import ZoneInfo
from datetime import datetime

from odoo import fields
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from odoo.tools import DEFAULT_SERVER_DATE_FORMAT as DATE_FORMAT

from autogen_core.tools import FunctionTool

def get_todays_date(timezone_name: Annotated[str, "Timezone for the requested date."]) -> Annotated[str, f"Today's date with format: '{DATE_FORMAT}'."]:
    tz_info = ZoneInfo(timezone_name)
    dt = datetime.now(tz_info)
    res = fields.Date.to_string(dt)
    return res

class DateAiToolNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        res = {
            "tools": [
                FunctionTool(get_todays_date, description="Provides today's date.")
            ]
        }

        return res
