# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from .record_trigger_node import RecordTriggerNode

# Adapted from base_automation module
class OnEditTriggerNode(RecordTriggerNode):
    TRIGGER_METHOD_NAME = "write"

    def _register_hook(self):
        def patch_write():
            def write(self, vals, **kw):
                node_definitions = self.env['nuido_flow.node.definition']._get_node_definition(self, OnEditTriggerNode.TRIGGER_METHOD_NAME)
                if not node_definitions:
                    return write.origin(self, vals, **kw)

                records = self.with_env(self.env).filtered('id')
                old_values = {
                    record.id: {field_name: record[field_name] for field_name in vals if field_name in record._fields} for record in records
                }
                write.origin(self.with_env(node_definitions.env), vals, **kw)

                for node_def in node_definitions:
                    trigger_field_names = []
                    if node_def["trigger_field_ids"]:
                        trigger_field_names = [o["name"] for o in node_def["trigger_field_ids"]]
                    if "trigger_field_names" not in node_def or any(e for e in trigger_field_names if e in vals.keys()):
                        for record in records:
                            context = {
                                'active_model': record._name,
                                'active_record': record,
                                'active_ids': record.ids,
                                'active_id': record.id,
                                'old_values': old_values[record.id],
                                'is_debug': self.env.user.has_group('base.group_no_one'),
                                "active_node_definition_id": node_def.id,
                                "active_node_definition_uuid": node_def.uuid,
                            }
                            node_def.with_context(**context).run({})
                return True

            return write

        Model = self.env.get(self.definition["model"])

        if Model is None:
            return

        OnEditTriggerNode._patch(Model, OnEditTriggerNode.TRIGGER_METHOD_NAME, patch_write())

    def _unregister_hook(self):
        Model = self.env.get(self.definition["model"])
        OnEditTriggerNode._unpatch(Model, OnEditTriggerNode.TRIGGER_METHOD_NAME)

    def update_registry(self):
        if self.env.registry.ready:
            self._unregister_hook()
            self._register_hook()
            self.env.registry.registry_invalidated = True

    def _process(self, params):
        super()._process(params)

        self.update_registry()

        return params

    def cleanup(self):
        self._unregister_hook()
