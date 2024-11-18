/** @odoo-module */

import { registry } from "@web/core/registry";
import { reactive } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";

const quickboardService = {
    start(env, services) {
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

        async function saveFilter(startDate, endDate) {
            return await rpc("/quickboard/save_filter",{
                    start_date: startDate.toSQLDate(),
                    end_date: endDate.toSQLDate()
                });
        };

        async function saveTheme(theme) {
            return await rpc("/quickboard/save_theme",{
                    theme: theme
                });
        };

        quickboard.saveTheme = saveTheme;
        quickboard.saveFilter = saveFilter;
        quickboard.getQuickboardItemDefs = getQuickboardItemDefs;
        quickboard.getQuickboardItem = getQuickboardItem;
        quickboard.saveLayout = saveLayout;
        return quickboard;
    }
};

registry.category("services").add("quickboard", quickboardService);
