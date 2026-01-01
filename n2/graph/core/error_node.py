"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
import logging

from odoo.exceptions import UserError

from odoo.tools.rendering_tools import parse_inline_template, render_inline_template

from odoo.addons.n2.graph.core.base_node import BaseNode

_logger = logging.getLogger(__name__)

class ErrorNode(BaseNode):
    def _process(self, params):
        if "message" in params:
            msg = params["message"]
        else:
            variables = {}
            variables.update(**self.env.context)
            variables.update(**params)
            parsed = parse_inline_template(str(self.definition["message"]))
            msg = render_inline_template(parsed, variables)
        raise UserError(msg)