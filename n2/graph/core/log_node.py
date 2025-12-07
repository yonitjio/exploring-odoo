"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
import logging
import json
from odoo.tools import json_default

from .base_node import BaseNode

_logger = logging.getLogger(__name__)


class LogNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        tag = self.definition["tag"]

        log_msg = json.dumps(params, separators=(",", ":"), default=json_default)
        _logger.info("%s: %s", tag, log_msg)

        if "is_debug" in self.env.context and self.env.context["is_debug"]:
            try:
                debug_msg = (
                    "Context:  \n```\n"
                    + json.dumps(self.env.context, indent=4, default=json_default)
                    + "  \n```"
                )
                _logger.info("%s: %s", tag + "-debug", debug_msg)
            except Exception as e:
                _logger.info("Unable to log debug message", exc_info=True)
                raise

        return params
