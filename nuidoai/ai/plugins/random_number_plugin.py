# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import random
from typing import Annotated
from semantic_kernel.functions.kernel_function_decorator import kernel_function

from odoo.api import Environment

class RandomNumberPlugin:
    def __init__(self, env: Environment) -> None:
        self.env = env

    @kernel_function(description="Generate random number between two numbers.")
    def generate_random_number(self,
            a: Annotated[int, "Lower limit."],
            b: Annotated[int, "Upper limit."],
        ) -> Annotated[int, "The output is a random number between the lower and upper limit, inclusive."]:
        return random.randint(a, b)
