/** @odoo-module */

import { Component, useState } from "@odoo/owl";

export class HAccordion extends Component {
    static template = "web.haccordion";
    static components = { };
    static props = {
        name: { type: String },
        startItem: { type: Number, optional: true },
        slots: { type: Object, optional: true },
    };
    static defaultProps = {
        startItem: 0
    }

    setup() {
        this.state = useState({ activeItem: this.props.startItem });
        this.itemNames = Object.keys(this.props.slots);
    }

    onClick(item) {
        this.state.activeItem = item;
    }
}
