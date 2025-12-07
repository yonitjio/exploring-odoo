# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

from typing import Sequence

from odoo.tools import safe_eval

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from odoo.addons.nuido_flow.flows.tools.tools import get_default_context_for_eval, get_active_record_info

from .tools import get_lookup_nodes

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

class UpdateDataNode(BaseNode):
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

        ids_def = self.definition["ids"]
        try:
            ids = safe_eval.safe_eval(ids_def, context)
        except:
            _logger.warning("Exception on evaluation: %s", ids_def, exc_info=True)
            ids = -1

        if not isinstance(ids, Sequence):
            ids = [ids]

        model = self.definition["model"]
        res = self.env[model]
        count = res.search_count([("id", "in", ids)])
        if count > 0:
            values = {}
            for field in self.definition["fields"]:
                try:
                    value = safe_eval.safe_eval(field["value"], context)
                except:
                    _logger.warning("Exception on evaluation: %s", field["value"], exc_info=True)
                    value = None

                field = self.env["ir.model.fields"]._get(model, field["name"])
                if field.ttype in ('one2many', 'many2many'):
                    if type(value) == list:
                        values.update({ field["name"]: value })
                    else:
                        values.update({ field["name"]: [value] })
                else:
                    values.update({ field["name"]: value })

            res = self.env[model].browse(ids)
            if (len(res) > 0 and res[0].id > -1):
                for rec in res:
                    rec.write(values)

                return res

        return {
            "result": res
        }