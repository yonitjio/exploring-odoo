# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo import models, fields
from odoo.tools import frozendict, sql


from odoo.addons.nuido_base.tools.function_tool import create_object

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class CustomFieldStarterNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        model_name = self.definition["model"]
        field_name = self.definition["field_name"]
        field_description = self.definition["field_description"]

        ir_model = self.env["ir.model"]

        model_id = ir_model._get(model_name)

        if (model_id.id):
            model = self.env[model_name]

            count = self.env["ir.model.fields"].sudo().search_count([("name", "=", field_name), ("model_id", "=", model_id.id)])
            if count == 0:
                self.env['ir.model.fields'].sudo().create([{
                    'model_id': model_id.id,
                    'name': field_name,
                    'field_description': field_description,
                    'ttype': fields.Char.type,
                    'index': True,
                }])

                self.env.cr.commit()
                self.env.invalidate_all()

        return params

    def cleanup(self):
        remove_field = self.definition["remove_field"]
        if remove_field:
            model_name = self.definition["model"]
            field_name = self.definition["field_name"]

            model_id = self.env["ir.model"]._get(model_name)
            if (model_id.id):
                model = self.env[model_name]

                rec = self.env["ir.model.fields"].sudo().search([("name", "=", field_name), ("model_id", "=", model_id.id)])
                if len(rec) > 0:
                    rec.sudo().unlink()

                self.env.cr.commit()
                self.env.invalidate_all()
