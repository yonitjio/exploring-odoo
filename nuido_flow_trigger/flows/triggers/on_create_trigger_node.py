# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo import api
from odoo.tools import frozendict

from .record_trigger_node import RecordTriggerNode

# Adapted from base_automation module
class OnCreateTriggerNode(RecordTriggerNode):
    TRIGGER_METHOD_NAME = "create"

    def _register_hook(self):
        def patch_create():
            @api.model_create_multi
            def create(self, vals_list, **kw):
                node_definitions = self.env['nuido_flow.node.definition']._get_node_definition(self, OnCreateTriggerNode.TRIGGER_METHOD_NAME)
                if not node_definitions:
                    return create.origin(self, vals_list, **kw)

                records = create.origin(self.with_env(node_definitions.env), vals_list, **kw)
                for node_def in node_definitions:
                    for record in records:
                        context = {
                            'active_model': record._name,
                            'active_record': record,
                            'active_ids': record.ids,
                            'active_id': record.id,
                            'is_debug': self.env.user.has_group('base.group_no_one'),
                            'active_node_definition_id': node_def.id,
                            "active_node_definition_uuid": node_def.uuid,
                        }
                        node_def.with_context(**context).run({})

                return records.with_context(node_definition_ids=node_definitions.ids).with_env(self.env)

            return create

        Model = self.env.get(self.definition["model"])

        if Model is None:
            return

        OnCreateTriggerNode._patch(Model, OnCreateTriggerNode.TRIGGER_METHOD_NAME, patch_create())

    def _unregister_hook(self):
        Model = self.env.get(self.definition["model"])
        OnCreateTriggerNode._unpatch(Model, OnCreateTriggerNode.TRIGGER_METHOD_NAME)

    def _update_registry(self):
        if self.env.registry.ready:
            self._unregister_hook()
            self._register_hook()
            self.env.registry.registry_invalidated = True

    def _process(self, params):
        super()._process(params)

        self._update_registry()

        return params

    def cleanup(self):
        self._unregister_hook()
