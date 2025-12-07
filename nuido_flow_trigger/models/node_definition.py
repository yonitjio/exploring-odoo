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
import traceback
from collections import defaultdict

from odoo import models, fields, Command

from odoo.tools import DEFAULT_SERVER_DATETIME_FORMAT

from odoo.addons.nuido_base.tools.function_tool import create_object

from odoo.addons.nuido_flow.flows.core.base_node import FlowNode
from odoo.addons.nuido_flow.models import registry_category as rcat

from ..tools.tools import get_timedelta


RECORD_TRIGGERS = [
    "create",
    "write",
    "unlink"
]

SCHEDULE_TRIGGERS = [
    "schedule"
]

WEBHOOK_TRIGGERS = [
    "webhook"
]

class NodeDefinition(models.Model):
    _inherit = "nuido_flow.node.definition"

    trigger_definition = fields.Text("Trigger Definition")
    trigger_method = fields.Char("Method")

    trigger_model_id = fields.Many2one("ir.model", string="Model",
            domain=[("field_id", "!=", False)])
    trigger_model_name = fields.Char(related="trigger_model_id.model", string="Model Name",
            readonly=True, inverse="_inverse_trigger_model_name")

    trigger_field_ids = fields.Many2many("ir.model.fields", string="Fields",
            domain="[('model_id', '=?', trigger_model_id)]")
    trigger_field_names = fields.Char(string="Field Names",
            readonly=True, store=True, inverse="_inverse_trigger_field_names")

    trigger_interval = fields.Integer("Interval")
    trigger_interval_type = fields.Selection(string="Interval Type", selection=[
            ("minute", "Minute"),
            ("hour", "Hour"),
            ("day", "Day"),
            ("month", "Month"),
        ])
    trigger_last_run = fields.Datetime(readonly=True, copy=False)
    trigger_webhook_id = fields.Char("Webhook Id", copy=False);

    _sql_constraints = [
        ('unique_webhook_id', 'unique(trigger_webhook_id)', 'Duplicate trigger_webhook_id.'),
    ]

    def _inverse_trigger_model_name(self):
        for rec in self:
            rec.trigger_model_id = self.env["ir.model"]._get(rec.trigger_model_name)

    def _inverse_trigger_field_names(self):
        for rec in self:
            if rec.trigger_model_name:
                trigger_field_names = json.loads(rec.trigger_field_names)
                commands = [Command.clear()]
                if len(trigger_field_names) > 0:
                    for field_name in trigger_field_names:
                        field_id = self.env["ir.model.fields"]._get(rec.trigger_model_name, field_name["value"])
                        commands.append(Command.link(field_id.id))

                rec.trigger_field_ids = commands
            else:
                rec.trigger_field_ids = None

    def _get_trigger_node(self, rec):
        trigger_node = None
        trigger_definition = None

        definitions = json.loads(rec.definition)
        create_function_registry = self.env["nuido_base.registry"].search_read([("category", "=", rcat.CREATE_FUNCTION)])

        node_def = next((o for o in definitions if o["type"] == "StartNode"), None)
        if (node_def is not None):
            trigger_node_def = next((
                        o for o in definitions if (
                            len(o["next_nodes"]) > 0
                            and o["next_nodes"][0]["id"] == node_def["id"]
                            and "role" in o["next_nodes"][0]["spec"]
                            and o["next_nodes"][0]["spec"]["role"] == "trigger"
                        )
                    ), None
                )

            if trigger_node_def is not None:
                trigger_definition = json.dumps(trigger_node_def)
                trigger_node: FlowNode | None = create_object(self.env, create_function_registry, definitions, trigger_node_def["type"], trigger_node_def)

        return trigger_definition, trigger_node

    def write(self, vals):
        cleanup = False;
        trigger_definition = None;
        trigger_node = None;

        if "raw" in vals:
            vals["definition"] = None
            vals["trigger_definition"] = None
            vals["trigger_method"] = None
            vals["trigger_model_id"] = None
            vals["trigger_model_name"] = None
            vals["trigger_field_ids"] = None
            vals["trigger_field_names"] = None
            vals["trigger_interval"] = None
            vals["trigger_interval_type"] = None
            vals["is_processed"] = False
            vals["trigger_webhook_id"] = None

            processed = self.env["nuido_flow.node.definition"].search_count([
                ("is_processed", "=", True),
                ("trigger_method", "=", self.trigger_method),
                ("trigger_model_id", "=", self.trigger_model_id.id),
                ("id", "!=", self.id)
            ])

            if processed == 0:
                cleanup = True

            if self.is_processed:
                trigger_definition, trigger_node = self._get_trigger_node(self)

        res = super(NodeDefinition, self).write(vals)

        if cleanup:
            if trigger_definition is not None and trigger_node is not None:
                trigger_node.cleanup()

        return res

    def unlink(self):
        trigger_nodes = defaultdict(object);

        for rec in self:
            if rec.is_processed:
                _, trigger_node = self._get_trigger_node(rec)
                if trigger_node:
                    info = (rec.trigger_method, rec.trigger_model_name)
                    if info not in trigger_nodes:
                        trigger_nodes[info] = trigger_node

        res = super(NodeDefinition, self).unlink()

        for method, model_name in trigger_nodes:
            trigger_node = trigger_nodes[(method, model_name)]
            processed = self.env["nuido_flow.node.definition"].search_count([
                ("is_processed", "=", True),
                ("trigger_method", "=", method),
                ("trigger_model_name", "=", model_name),
            ])

            if processed == 0:
                trigger_node.cleanup()

        return res

    def _before_process_trigger_node(self, rec, trigger_definition, trigger_node):
        pass

    def _process_record(self, rec):
        super()._process_record(rec)
        trigger_definition, trigger_node = self._get_trigger_node(rec)
        if trigger_definition is not None and trigger_node is not None:
            rec.trigger_definition = trigger_definition
            rec.trigger_method = trigger_node.TRIGGER_METHOD_NAME

            if trigger_node.TRIGGER_METHOD_NAME in RECORD_TRIGGERS:
                rec.trigger_model_name = trigger_node.definition["model"]

                if trigger_node.TRIGGER_METHOD_NAME == "write":
                    if "fields" in trigger_node.definition and len(trigger_node.definition["fields"]) > 0:
                        rec.trigger_field_names = json.dumps(trigger_node.definition["fields"])

            elif trigger_node.TRIGGER_METHOD_NAME in SCHEDULE_TRIGGERS:
                rec.trigger_interval = trigger_node.definition["interval"]
                rec.trigger_interval_type = trigger_node.definition["interval_type"]

            elif trigger_node.TRIGGER_METHOD_NAME in WEBHOOK_TRIGGERS:
                rec.trigger_webhook_id = trigger_node.definition["webhook_id"]

            self._before_process_trigger_node(rec, trigger_definition, trigger_node)
            trigger_node.process(rec)

            return trigger_definition, trigger_node

    def _get_node_definition(self, records, trigger_method, trigger_field = None):
        domain = [('trigger_model_name', '=', records._name), ('trigger_method', '=', trigger_method)]
        if trigger_field:
            domain.append(('trigger_field', '=', trigger_field))
        node_definition = self.with_context(active_test=True).sudo().search(domain)
        return node_definition.with_env(self.env)

    def _update_registry(self):
        if self.env.registry.ready:
            self._unregister_hook()
            self._register_hook()
            self.env.registry.registry_invalidated = True

    def _register_hook(self):
        patched_models = defaultdict(set)
        for node_definition in self.search([("is_processed", "=", True), ("trigger_method", "in", RECORD_TRIGGERS)]):
            model_name = node_definition["trigger_model_name"]
            method = node_definition["trigger_method"]

            if model_name not in patched_models[method]:
                trigger_definition, trigger_node = self._get_trigger_node(node_definition)
                if trigger_definition is not None and trigger_node is not None:
                    trigger_node._unregister_hook()
                    trigger_node._register_hook()

                patched_models[method].add(model_name)

    def _unregister_hook(self):
        for node_definition in self.search([("trigger_model_id", "!=", False)]):
            trigger_definition, trigger_node = self._get_trigger_node(node_definition)
            if trigger_definition is not None and trigger_node is not None:
                trigger_node._unregister_hook()

    def _auto_run(self, params={}):
        node_definitions = self.search([("is_processed", "=", True), ("trigger_method", "in", SCHEDULE_TRIGGERS)])
        for node_definition in node_definitions:
            interval = node_definition.trigger_interval
            interval_type = node_definition.trigger_interval_type
            last_run = node_definition.trigger_last_run

            if not last_run:
                last_run = node_definition.create_date.replace(hour=0, minute=0, second=0, microsecond=0)

            next_run = last_run + get_timedelta(interval, interval_type)
            now = fields.Datetime.now().replace(second=0, microsecond=0)
            if next_run <= now:
                try:
                    context = {
                        "uid": node_definition.create_uid.id,
                        "user": node_definition.create_uid,
                        "is_debug": node_definition.create_uid.has_group('base.group_no_one'),
                        "active_node_definition_id": node_definition.id,
                        "active_node_definition_uuid": node_definition.uuid,
                    }

                    node_definition.with_context(**context).run(params)
                except Exception:
                    _logger.error(traceback.format_exc())

                node_definition.write({'trigger_last_run': now.strftime(DEFAULT_SERVER_DATETIME_FORMAT)})
                self._cr.commit()
