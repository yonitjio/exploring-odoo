# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from .record_trigger_node import RecordTriggerNode

# Adapted from base_automation module
class OnDeleteTriggerNode(RecordTriggerNode):
    TRIGGER_METHOD_NAME = "unlink"

    def _register_hook(self):
        def patch_unlink():
            def unlink(self, **kwargs):
                node_definitions = self.env['nuido_flow.node.definition']._get_node_definition(self, OnDeleteTriggerNode.TRIGGER_METHOD_NAME)
                if node_definitions:
                    records = self.with_env(node_definitions.env)
                    for node_def in node_definitions:
                        for record in records:
                            context = {
                                'active_model': record._name,
                                'active_record': record,
                                'active_ids': record.ids,
                                'active_id': record.id,
                                'is_debug': self.env.user.has_group('base.group_no_one'),
                                "active_node_definition_id": node_def.id,
                                "active_node_definition_uuid": node_def.uuid,
                            }
                            node_def.with_context(**context).run({})

                return unlink.origin(self, **kwargs)

            return unlink

        Model = self.env.get(self.definition["model"])

        if Model is None:
            return

        OnDeleteTriggerNode._patch(Model, OnDeleteTriggerNode.TRIGGER_METHOD_NAME, patch_unlink())

    def _unregister_hook(self):
        Model = self.env.get(self.definition["model"])
        OnDeleteTriggerNode._unpatch(Model, OnDeleteTriggerNode.TRIGGER_METHOD_NAME)

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
