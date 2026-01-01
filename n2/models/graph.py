"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""

import logging

_logger = logging.getLogger(__name__)

import json
from odoo import models, fields, api

from odoo.tools.json import json_default
from odoo.addons.n2.graph.tools.function_tool import get_function
from odoo.addons.n2.graph.tools.function_tool import create_object

from odoo.addons.n2.graph.core.base_node import N2Node
from odoo.addons.n2.models import registry_category as rcat

from . import registry_category as rcat
from ..graph.tools.tools import run_nodes
from ..graph.tools.tools import send_monitoring_notification


class Graph(models.Model):
    _name = "n2.graph"
    _description = "Graph"
    _rec_name = "title"

    title = fields.Char("Title", required=True)
    raw = fields.Text("Raw Json", required=True)
    definition = fields.Text("Definition")
    is_processed = fields.Boolean("Processed", default=False)

    uuid = fields.Char("Uuid")

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if "is_processed" in vals:
                vals["is_processed"] = False
        return super().create(vals_list)

    def write(self, vals):
        cleanup = False
        cleanable_nodes = []

        if "raw" in vals:
            vals["definition"] = ""
            vals["is_processed"] = False

            raw = vals["raw"]
            jsonRaw = json.loads(raw)
            jsonRaw["isProcessed"] = False

            if self.is_processed:
                cleanup = True
                cleanable_nodes = self._get_cleanable_nodes(self.definition)

            vals["raw"] = json.dumps(jsonRaw, indent=4)

        res = super(Graph, self).write(vals)

        if cleanup:
            for cleanable_node in cleanable_nodes:
                if cleanable_node is not None:
                    cleanable_node.cleanup(self)

        return res

    def unlink(self):
        cleanable_nodes = []

        for rec in self:
            if rec.is_processed:
                cleanable_nodes = self._get_cleanable_nodes(rec.definition)

        res = super(Graph, self).unlink()

        for cleanable_node in cleanable_nodes:
            cleanable_node.cleanup(self)

        return res

    def _get_aux_nodes(self, definition, roles=[]):
        res = []

        definitions = json.loads(definition)
        create_function_registry = self.env["n2.registry"].search_read([("category", "=", rcat.CREATE_FUNCTION)])

        start_node_def = next((o for o in definitions if o["type"] == "StartNode"), None)
        if start_node_def is not None:
            for aux_nodes in start_node_def["aux_nodes"]:
                if "spec" in aux_nodes and aux_nodes["spec"]["role"] in roles:
                    aux_node_def = next((o for o in definitions if o["id"] == aux_nodes["id"]), None)
                    if aux_node_def:
                        aux_node: N2Node | None = create_object(
                            self.env,
                            create_function_registry,
                            definitions,
                            aux_node_def["type"],
                            aux_node_def,
                        )
                        res.append(aux_node)

        return res

    def _get_cleanable_nodes(self, definition):
        return self._get_aux_nodes(definition, ["context", "starter"])

    def _get_starter_nodes(self, definition):
        return self._get_aux_nodes(definition, ["starter"])

    def _get_context_nodes(self, definition):
        return self._get_aux_nodes(definition, ["context"])

    def _process_record(self, rec):
        starter_nodes = self._get_starter_nodes(rec.definition)
        for starter_node in starter_nodes:
            if starter_node is not None:
                starter_node.process(rec)

    def _process_graph(self, raw):
        obj = json.loads(raw, object_hook=self.json_object_hook)

        node_infos = []

        build_function_registry = self.env["n2.registry"].search_read([("category", "=", rcat.BUILD_FUNCTION)])
        for node in obj["nodes"]:
            node_type: str = node["type"]
            build_function = get_function(build_function_registry, node_type)
            node_info = None
            if build_function:
                node_info = build_function(node, obj["nodes"], obj["edges"])
            else:
                raise Exception(f"Build function not found for node: {node_type}")

            node_infos.append(node_info)

        post_process_function_registry = self.env["n2.registry"].search_read(
            [("category", "=", rcat.POST_PROCESS_FUNCTION)]
        )

        for info in node_infos:
            post_process_function = get_function(post_process_function_registry, info["type"])
            if post_process_function:
                post_process_function(info, node_infos)

        infos = json.dumps(node_infos, indent=4)

        return obj, infos

    def _do_process_graph(self, rec):
        obj, infos = self._process_graph(rec.raw)
        rec.uuid = obj["id"]
        rec.definition = infos
        rec.is_processed = True
        self._process_record(rec)

    def action_process_graphs(self):
        for rec in self.browse(self.env.context["active_ids"]):
            self._do_process_graph(rec)

    def action_open_designer(self):
        self.ensure_one()
        return {"type": "ir.actions.client", "tag": "N2Designer"}

    def action_edit_record(self):
        self.ensure_one()
        return {
            "type": "ir.actions.act_window",
            "name": "Graph",
            "view_mode": "form",
            "res_model": "n2.graph",
            "res_id": self.id,
        }

    def json_object_hook(self, obj):
        keys = [
            "screenSize",
            "size",
            "screenPosition",
            "position",
            "cssClass",
            "path",
            "top",
            "left",
            "width",
            "height",
        ]
        for key in keys:
            obj.pop(key, None)

        return obj

    def process_graph(self):
        self.ensure_one()
        context = {
            "active_graph_id": self.id,
            "active_graph_uuid": self.uuid,
        }

        self.with_context(**context)._do_process_graph(self)

    def _send_monitoring_notification(self, type):
        monitor_context = {"graph_id": self.uuid}
        send_monitoring_notification(self.env, type, monitor_context)

    def _run(self, definitions, node_def, params):
        create_function_registry = self.env["n2.registry"].search_read([("category", "=", rcat.CREATE_FUNCTION)])
        res = run_nodes(self.env, create_function_registry, definitions, node_def, params)
        return res

    def run(self, params):
        self.ensure_one()
        if not self.is_processed:
            raise Exception("Definition is not yet processed.")

        definitions = json.loads(self.definition)

        res = None
        start_node_def = next((o for o in definitions if o["type"] == "StartNode"), None)

        if start_node_def is not None:
            monitor_process = self.env["ir.config_parameter"].sudo().get_param("n2.monitor_process", False)

            if monitor_process:
                self._send_monitoring_notification("start_graph")

            parametersJson = {}
            if len(start_node_def["parameters"].strip()) > 0:
                parameters = start_node_def["parameters"]
                parametersJson = json.loads(parameters)

            context = {
                "run_params": params,
                "start_params": parametersJson,
                "active_graph_id": self.id,
                "active_graph_uuid": self.uuid,
            }

            context_nodes = self._get_context_nodes(self.definition)
            for context_node in context_nodes:
                custom_context = context_node.process(context)
                context.update(custom_context)

            res = self.with_context(**context)._run(definitions, start_node_def, params)

            if monitor_process:
                self._send_monitoring_notification("end_graph")

        return res
