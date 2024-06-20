/** @odoo-module */

import { registry } from "@web/core/registry";
import { reactive } from "@odoo/owl";

const statisticsService = {
    dependencies: ["rpc"],
    start(env, { rpc }) {
        const statistics = reactive({ isReady: false });

        async function loadData(period) {
            statistics.period = period;
            statistics.isReady = false;
            const updates = await rpc("/gemini_dashboard/statistics",{
                period: parseInt(period),
            });
            Object.assign(statistics, updates, { isReady: true });
        }

        async function autoLoadData() {
            loadData(statistics.period);
        }

        statistics.DEFAULT_PERIOD = 7;
        statistics.period = statistics.DEFAULT_PERIOD;
        statistics.loadData = loadData;

        setInterval(autoLoadData, 10*60*1000);
        loadData(statistics.DEFAULT_PERIOD);

        return statistics;
    },
};

registry.category("services").add("gemini_dashboard.statistics", statisticsService);
