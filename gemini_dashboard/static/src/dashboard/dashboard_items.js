/** @odoo-module */

import { LineChartCard } from "./line_chart_card/line_chart_card";
import { registry } from "@web/core/registry";

const items = [
    {
        id: "line_chart",
        description: "Sales Orders",
        Component: LineChartCard,
        props: (data) => ({
            title: "Sales Orders",
            data: data.orders,
        })
    }
]

items.forEach(item => {
    registry.category("gemini_dashboard").add(item.id, item);
});
