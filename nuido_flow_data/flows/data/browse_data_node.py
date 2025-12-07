# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

from collections.abc import Sequence

from odoo.tools import safe_eval

from odoo.addons.nuido_base.tools.function_tool import create_object

from odoo.addons.nuido_flow.flows.tools.tools import get_default_context_for_eval, get_active_record_info
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from odoo.addons.nuido_flow.flows.core.base_node import FlowNode

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

class BrowseDataNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        context = get_default_context_for_eval(self.env)
        if params is not None:
            context['params'] = params

        info = get_active_record_info(self.env)
        context = {**context, **info}

        result = {}
        if len(self.definition["aux_nodes"]) > 0:
            node_id = self.definition["aux_nodes"][0]
            node_def = next((o for o in self.definitions if o["id"] == node_id["id"]), None)
            if node_def:
                node: FlowNode | None = create_object(self.env, self.create_function_registry, self.definitions, node_def["type"], node_def)

                reference_values_def = self.definition["reference_values"]

                try:
                    reference_values = safe_eval.safe_eval(reference_values_def, context)
                except:
                    _logger.warning("Exception on evaluation: %s", reference_values_def, exc_info=True)
                    reference_values = []

                if not isinstance(reference_values, Sequence):
                    reference_values = [reference_values]

                reference_field = self.definition["reference_field"]

                domain = { "domain": [(reference_field, "in", reference_values)] }
                data = node.process(domain)
                result = data

        return result
