/** @odoo-module */

import { registry } from "@web/core/registry";
import { LazyComponent } from "@web/core/assets";
import { Component, xml } from "@odoo/owl";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";

class GeminiDashboardLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
    <LazyComponent bundle="'gemini_dashboard.dashboard'" Component="'GeminiDashboard'" props="props"/>
    `;
    static props = {
        ...standardActionServiceProps,
        props: { type: Object, optional: true },
        Component: { type: Function, optional: true },
    };
}

registry
    .category("actions")
    .add("gemini_dashboard.dashboard", GeminiDashboardLoader);
