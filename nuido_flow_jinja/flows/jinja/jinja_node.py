# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import logging

import json
from jinja2 import Environment, FunctionLoader, select_autoescape

from odoo.addons.nuido_flow.flows.tools.tools import get_default_context_for_eval, get_active_record_info
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from odoo.addons.nuido_flow_data.flows.data.tools import get_lookup_nodes

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

class JinjaNode(BaseNode):
    def _template_loader(self, template):
        return self.definition["template"]

    def _process(self, params):
        super()._process(params)

        context = get_default_context_for_eval(self.env)
        if params is not None:
            context['params'] = params

        info = get_active_record_info(self.env)
        context = {**context, **info}

        nodes, lookup_functions = get_lookup_nodes(self)

        context["nodes"] = nodes
        context["lookup"] = lookup_functions

        jinja_env = Environment(loader=FunctionLoader(self._template_loader), autoescape=select_autoescape())
        template = jinja_env.get_template("template")
        try:
            result = template.render(context)
        except:
            _logger.warning("Exception on rendering: %s", context, exc_info=True)
            result = "{}"

        if (self.definition["as_dictionary"]):
            try:
                result = json.loads(result)
            except:
                _logger.warning("Exception on evaluation: %s", result, exc_info=True)
                result = {}

        return result