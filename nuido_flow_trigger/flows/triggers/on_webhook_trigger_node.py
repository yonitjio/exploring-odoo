# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

# Adapted from base_automation module
class OnWebhookTriggerNode(BaseNode):
    TRIGGER_METHOD_NAME = "webhook"

    def _process(self, params):
        super()._process(params)

        webhook_id = self.definition["webhook_id"]

        count = self.env["nuido_flow.node.definition"] \
                .with_context(active_test=True) \
                .search_count([
                    ('trigger_webhook_id', '=', webhook_id),
                    ('id', '!=', params["id"])
                ])

        if count > 0:
            raise Exception("Duplicate Webhook Id.")

        return params;

    def cleanup(self):
        pass
