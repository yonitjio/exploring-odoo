/** @odoo-module **/
import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class AiSidebarToggler extends Component {
    static template = "ai_chat.AiSidebarToggler";
    static props = {}
}

export const aiSidebarTogglerSystrayItem = {
    Component: AiSidebarToggler,
};

registry
    .category("systray")
    .add("AiSidebarTogglerSystrayItem", aiSidebarTogglerSystrayItem, {
        sequence: 1,
    });
