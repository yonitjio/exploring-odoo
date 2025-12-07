/** @odoo-module **/
import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class AiDocSidebarToggler extends Component {
    static template = "ai_doc.AiDocSidebarToggler";
    static props = {}
}

export const aiDocSidebarTogglerSystrayItem = {
    Component: AiDocSidebarToggler,
};

registry
    .category("systray")
    .add("AiDocSidebarTogglerSystrayItem", aiDocSidebarTogglerSystrayItem, {
        sequence: 1000,
    });
