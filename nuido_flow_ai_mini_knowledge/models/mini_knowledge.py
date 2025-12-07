# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import logging
_logger = logging.getLogger(__name__)

from odoo import models, fields, api

from autogen_core.memory import MemoryMimeType

from odoo.addons.nuido_flow_ai.flows.ai.memory_utils import create_memory, add_memory_content, remove_memory_content, close_memory

from ..flows.ai.const import COLLECTION_NAME

class MiniKnowledge(models.Model):
    _name = "nuido_flow_ai.mini.knowledge"
    _description = "Mini Knowledge Base"
    _rec_name = "title"

    title = fields.Char("Title", required=True)
    content = fields.Text("Content")
    summary = fields.Text("Summary")
    is_processed = fields.Boolean("Processed", default=False)

    def _process_knowledge(self, rec):
        node_definition_id = self.env['ir.config_parameter'].get_param("nuido_flow_ai_mini_knowledge.mini_knowledge_summarizer_node_definition_id", False)
        if node_definition_id:
            node_definition = self.env['nuido_flow.node.definition'].sudo().browse(int(node_definition_id)).exists()
            monitor_process = self.env['ir.config_parameter'].get_param("nuido_flow.monitor_process", False) == "True"
            context = {
                "uid": self.env.uid,
                "user": self.env.user,
                "is_debug": self.env.user.has_group('base.group_no_one'),
                "active_node_definition_id": int(node_definition_id),
                "active_node_definition_uuid": node_definition.uuid,
                "monitor_process": monitor_process,
                "skip_monitor": False
            }

            res = node_definition.with_context(**context).run({
                    "message": rec.content
                })

            rec.summary = f'#Knowledge Base Id:{rec.id}\n##Summary\n{res["result"]["summary"]}'

            memory = create_memory(COLLECTION_NAME)
            add_memory_content(memory, rec.summary, MemoryMimeType.TEXT, {
                    "rec_id": rec.id
                })

            close_memory(memory)
            return res
        return False

    def _reset_knowledge(self, rec):
        memory = create_memory(COLLECTION_NAME)
        remove_memory_content(memory, {
                "rec_id": rec.id
            }
        )
        close_memory(memory)

    def write(self, vals):
        if "is_processed" in vals and not vals["is_processed"]:
            self._reset_knowledge(self)
        return super(MiniKnowledge, self).write(vals)

    def action_process_knowledge(self):
        for rec in self.browse(self.env.context["active_ids"]):
            if not rec.is_processed:
                res = self._process_knowledge(rec)
                rec.is_processed = True if res else False

    def action_reset_knowledge(self):
        for rec in self.browse(self.env.context["active_ids"]):
            if rec.is_processed:
                rec.is_processed = False

    @api.onchange("title", "content")
    def _new_or_updated(self):
        self.update({
            "summary": "",
            "is_processed": False
        })

    def unlink(self):
        for rec in self:
            if rec.is_processed:
                self._reset_knowledge(rec)

        return super().unlink()
