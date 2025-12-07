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
from odoo.tools import DEFAULT_SERVER_DATE_FORMAT as DATE_FORMAT

class DatePlugin:
    def __init__(self, env: Environment) -> None:
        self.env = env

    @kernel_function(description="Provides today's date.")
    def get_todays_date(self) -> Annotated[str, f"Today's date with format: '{DATE_FORMAT}'."]:
        res = fields.Date.to_string(fields.Date.today())
        return res
