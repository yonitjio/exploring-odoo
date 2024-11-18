/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";

import { Component, useRef, useState, useExternalListener } from "@odoo/owl";

export class QbColorList extends Component {
    static template = "quickboard.QbColorList";
    static defaultProps = {
        forceExpanded: false,
        isExpanded: false,
    };
    static props = {
        canToggle: { type: Boolean, optional: true },
        colors: Array,
        forceExpanded: { type: Boolean, optional: true },
        isExpanded: { type: Boolean, optional: true },
        onColorSelected: Function,
        selectedColor: { type: Number, optional: true },
    };

    setup() {
        this.colorlistRef = useRef("colorlist");
        this.state = useState({ isExpanded: this.props.isExpanded });
        useExternalListener(window, "click", this.onOutsideClick);
    }

    get colors() {
        return this.props.colors;
    }

    onColorSelected(id) {
        const idx = this.props.colors.indexOf(id);
        this.props.onColorSelected(idx);
        if (!this.props.forceExpanded) {
            this.state.isExpanded = false;
        }
    }

    onOutsideClick(ev) {
        if (this.colorlistRef.el.contains(ev.target) || this.props.forceExpanded) {
            return;
        }
        this.state.isExpanded = false;
    }

    onToggle(ev) {
        if (this.props.canToggle) {
            ev.preventDefault();
            ev.stopPropagation();
            this.state.isExpanded = !this.state.isExpanded;
            this.colorlistRef.el.firstElementChild.focus();
        }
    }
}
