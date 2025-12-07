# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from dateutil.relativedelta import relativedelta
from datetime import datetime as dt, timedelta
from odoo.tools import date_utils as dtu

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

DATE_RANGE_FACTOR = {
    'minute': 1,
    'hour': 60,
    'day': 24 * 60,
    'week': 7 * 24 * 60,
    'month': 30 * 24 * 60,
    False: 0,
}

# Adapted from base_automation module
class OnScheduleTriggerNode(BaseNode):
    TRIGGER_METHOD_NAME = "schedule"

    def _calculate_interval(self, flows) -> int:
        def get_delay(rec):
            return abs(rec.trigger_interval) * DATE_RANGE_FACTOR[rec.trigger_interval_type]

        delay = min(flows.mapped(get_delay), default=0)
        delay = min(max(1, delay), 4 * 60) if delay else 4 * 60
        return delay

    def _update_cron(self):
        cron = self.env.ref('nuido_flow_trigger.ir_cron_nuido_flow', raise_if_not_found=False)
        if cron:
            flows = self.env["nuido_flow.node.definition"] \
                .with_context(active_test=True) \
                .search([
                    ('trigger_method', '=', OnScheduleTriggerNode.TRIGGER_METHOD_NAME),
                    ('is_processed', '=', True)
                ])

            now = dt.now().replace(second=0, microsecond=0)
            today = dtu.start_of(now, "day")

            interval = self._calculate_interval(flows);
            delta = (((now - today).total_seconds() // 60) // interval) * interval;
            nextcall = today + timedelta(minutes=delta)
            while nextcall < now:
                nextcall = nextcall + timedelta(minutes=interval)

            cron.try_write({
                'active': bool(flows),
                'interval_type': 'minutes',
                'interval_number': interval,
                'nextcall': nextcall
            })

    def _process(self, params):
        super()._process(params)
        self._update_cron()

        return params

    def cleanup(self):
        self._update_cron()
