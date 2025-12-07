/** @odoo-module */

import { registry } from "@web/core/registry";
import { reactive } from "@odoo/owl";

const quickboardService = {
    dependencies: ["rpc", "ui"],
    start(env, { rpc, ui }) {
        const quickboard = reactive({
            items: {},
            isReady: false
        });

        async function getQuickboardItemDefs() {
            quickboard.isReady = false;
            quickboard.items = {};
            const updates = await rpc("/quickboard/item_defs",{});
            Object.assign(quickboard.items, updates);
            quickboard.isReady = true;
        };

        async function getQuickboardItem(itemId, startDate, endDate) {
            return await rpc("/quickboard/item",{
                    item_id: itemId,
                    start_date: startDate.toSQLDate(),
                    end_date: endDate.toSQLDate()
                });
        };

        async function saveLayout(layout){
            await rpc("/quickboard/save_layout",{
                "layout": layout
            });
        };

        quickboard.getQuickboardItemDefs = getQuickboardItemDefs;
        quickboard.getQuickboardItem = getQuickboardItem;
        quickboard.saveLayout = saveLayout;
        return quickboard;
    }
};

registry.category("services").add("quickboard", quickboardService);
