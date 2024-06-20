/** @odoo-module */

import { Component } from "@odoo/owl";

export class DashboardItem extends Component {
    static template = "gemini_dashboard.DashboardItem"
    static props = {
        slots: {
            type: Object,
            shape: {
                default: Object
            },
        },
        size: {
            type: Number,
            default: 1,
            optional: true,
        },
    };
}
