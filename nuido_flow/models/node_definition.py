# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging
_logger = logging.getLogger(__name__)

import json
from odoo import models, fields, SUPERUSER_ID
from odoo.api import Environment
from odoo.modules.registry import Registry

from odoo.tools.json import json_default
from odoo.addons.nuido_base.tools.function_tool import get_function
from odoo.addons.nuido_base.tools.function_tool import create_object

from odoo.addons.nuido_flow.flows.core.base_node import FlowNode
from odoo.addons.nuido_flow.models import registry_category as rcat

from . import registry_category as rcat
from ..flows.tools.tools import run_nodes
from ..flows.tools.tools import send_monitoring_notification

class NodeDefinition(models.Model):
    _name = "nuido_flow.node.definition"
    _description = "Nuido Flow Node Definition"
    _inherit = "nuido_base.node.definition"

    uuid = fields.Char("UUID")

    def write(self, vals):
        cleanup = False
        starter_definition = None
        starter_node = None

        if self.is_processed:
            cleanup = True
            starter_definition, starter_node = self._get_starter_node(self)

        res = super(NodeDefinition, self).write(vals)

        if cleanup:
            if starter_definition is not None and starter_node is not None:
                starter_node.cleanup()

        return res

    def unlink(self):
        starter_nodes = [];

        for rec in self:
            if rec.is_processed:
                _, starter_node = self._get_starter_node(rec)
                if starter_node:
                    starter_nodes.append(starter_node)

        res = super(NodeDefinition, self).unlink()

        for starter_node in starter_nodes:
            starter_node.cleanup()

        return res

    def _get_starter_node(self, rec):
        starter_node = None
        starter_definition = None

        definitions = json.loads(rec.definition)
        create_function_registry = self.env["nuido_base.registry"].search_read([("category", "=", rcat.CREATE_FUNCTION)])

        node_def = next((o for o in definitions if o["type"] == "StartNode"), None)
        if (node_def is not None):
            starter_node_def = next((o for o in definitions if (o["type"].endswith("StarterNode"))), None)

            if starter_node_def is not None:
                starter_definition = json.dumps(starter_node_def, default=json_default)
                starter_node: FlowNode | None = create_object(self.env, create_function_registry, definitions, starter_node_def["type"], starter_node_def)

        return starter_definition, starter_node

    def _process_record(self, rec):
        super()._process_record(rec)

        starter_definition, starter_node = self._get_starter_node(rec)
        if starter_definition is not None and starter_node is not None:
            starter_node.process(rec)

    def _process_node_definitions(self):
        self.ensure_one()
        obj, infos = self.process_node_definition(self.raw)
        self.uuid = obj["id"]
        self.definition = infos
        self.is_processed = True
        self._process_record(self)

    def action_open_flow_designer(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.client',
            'tag': 'NuidoFlowStudio'
        }

    def editRecord(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Node Definition',
            'view_mode': 'form',
            'res_model': 'nuido_flow.node.definition',
            'res_id': self.id,
        }

    def json_object_hook(self, obj):
        keys = ["vprops", "lastVprops", "edgeType", "joints", "links", "paths",
                "left", "top"];
        for key in keys:
            obj.pop(key, None)

        return obj

    def process_node_definition(self, raw):
        obj = json.loads(raw,
            object_hook = self.json_object_hook
        )

        node_infos = []

        build_function_registry = self.env["nuido_base.registry"].search_read([("category", "=", rcat.BUILD_FUNCTION)])
        for node in obj["nodes"]:
            node_type: str = node["nodeType"]
            build_function = get_function(build_function_registry, node_type)
            node_info = None
            if build_function:
                node_info = build_function(node, obj["edges"])
            else:
                raise Exception(f"Build function not found for node: {node_type}")

            node_infos.append(node_info)

        post_process_function_registry = self.env["nuido_base.registry"].search_read([("category", "=", rcat.POST_PROCESS_FUNCTION)])

        for info in node_infos:
            post_process_function = get_function(post_process_function_registry, info["type"])
            if post_process_function:
                post_process_function(info, node_infos)

        infos = json.dumps(node_infos, indent=4);

        return obj, infos;

    def _send_monitoring_notification(self, type):
        monitor_context = {
            'flow_id': self.uuid
        }
        send_monitoring_notification(self.env, type, monitor_context)


    def _run(self, definitions, node_def, params):
        create_function_registry = self.env["nuido_base.registry"].search_read([("category", "=", rcat.CREATE_FUNCTION)])
        run_nodes(self.env, create_function_registry, definitions, node_def, params)

    def run(self, params):
        self.ensure_one()
        if not self.is_processed:
            raise Exception("Definition is not yet processed.")

        definitions = json.loads(self.definition)

        node_def = next((o for o in definitions if o["type"] == "StartNode"), None)
        if node_def is not None:
            monitor_process = self.env['ir.config_parameter'].get_param("nuido_flow.monitor_process", False)

            if monitor_process:
                self._send_monitoring_notification('start_flow')

            parametersJson = {}
            if len(node_def["parameters"].strip()) > 0:
                parameters = node_def["parameters"]
                parametersJson = json.loads(parameters)
            self.with_context(run_params=params, start_params=parametersJson)._run(definitions, node_def, params)

            if monitor_process:
                self._send_monitoring_notification('end_flow')