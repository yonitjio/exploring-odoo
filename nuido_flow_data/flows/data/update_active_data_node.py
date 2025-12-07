# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

from odoo.tools import safe_eval

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from odoo.addons.nuido_flow.flows.tools.tools import get_default_context_for_eval, get_active_record_info

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

class UpdateActiveDataNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        context = get_default_context_for_eval(self.env)
        if params is not None:
            context['params'] = params

        info = get_active_record_info(self.env)
        context = {**context, **info}

        values = {}
        for field in self.definition["fields"]:
            try:
                value = safe_eval.safe_eval(field["value"], context)
            except:
                _logger.warning("Exception on evaluation: %s", field["value"], exc_info=True)
                value = None

            field = self.env["ir.model.fields"]._get(context["active_model"], field["name"])
            if field.ttype in ('one2many', 'many2many'):
                if type(value) == list:
                    values.update({ field["name"]: value })
                else:
                    values.update({ field["name"]: [value] })
            else:
                values.update({ field["name"]: value })

        res = context["active_record"]
        for rec in res:
            rec.write(values)

        return {
            "result": res
        }