# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import json

from odoo import fields

from odoo.addons.nuido_base.tools.function_tool import create_object

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class CustomFieldStarterNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        model = self.definition["model"]
        field_name = self.definition["field_name"]
        field_description = self.definition["field_description"]

        model_id = self.env["ir.model"]._get(model)

        if (model_id.id):
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

                tabel_name = model_id._table
                constraint_name = f"nuido_flow_unique_{tabel_name}"

                constraint = next((o for o in self.env[model]._sql_constraints if o[0] == constraint_name), None)
                if constraint is None:
                    self.env[model].sudo()._sql_constraints.append([
                            constraint_name,
                            f"unique({field_name})",
                            f"Duplicate {field_name}."
                        ])
                    self.env[model].sudo()._add_sql_constraints()


        return params

    def cleanup(self):
        remove_field = self.definition["remove_field"]
        if remove_field:
            model = self.definition["model"]
            field_name = self.definition["field_name"]

            model_id = self.env["ir.model"]._get(model)
            if (model_id.id):
                tabel_name = model_id._table
                constraint_name = f"nuido_flow_unique_{tabel_name}"

                constraint = next((o for o in self.env[model]._sql_constraints if o[0] == constraint_name), None)
                if constraint is not None:
                    self.env[model].sudo()._sql_constraints.remove(constraint)
                    self.env[model].sudo()._add_sql_constraints()

                rec = self.env["ir.model.fields"].sudo().search([("name", "=", field_name), ("model_id", "=", model_id.id)])
                if len(rec) > 0:
                    rec.sudo().unlink()

                self.env.cr.commit()
                self.env.invalidate_all()
