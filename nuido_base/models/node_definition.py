# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo import models, fields, api

class NodeDefinition(models.Model):
    _name = "nuido_base.node.definition"
    _description = "Node definition"
    _rec_name = "title"

    title = fields.Char("Title", required=True)
    raw = fields.Text("Raw Json", required=True)
    definition = fields.Text("Definition")
    is_processed = fields.Boolean("Processed", default=False)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if "is_processed" in vals:
                vals["is_processed"] = False
        return super().create(vals_list)

    def write(self, vals):
        if "raw" in vals:
            vals["definition"] = ""
            vals["is_processed"] = False
        return super(NodeDefinition, self).write(vals)

    def _process_record(self, rec):
        pass

    def action_process_node_definitions(self):
        for rec in self.browse(self.env.context["active_ids"]):
            _, infos = self.process_node_definition(rec.raw)
            rec.definition = infos
            rec.is_processed = True
            self._process_record(rec)

    def action_open_designer(self):
        pass

    def editRecord(self):
        pass

    def process_node_definition(self, raw):
        return None, None
