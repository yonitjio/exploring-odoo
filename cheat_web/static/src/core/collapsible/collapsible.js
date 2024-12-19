/** @odoo-module */

import { Component, useState } from "@odoo/owl";

export class Collapsible extends Component {
    static template = "web.collapsible";
    static components = { };
    static props = {
        name: { type: String },
        title: { type: String },
        slots: { type: Object, optional: true },
        collapsed: { type: Boolean, optional: true}
    };
    static defaultProps = {
        collapsed: true
    }
}
