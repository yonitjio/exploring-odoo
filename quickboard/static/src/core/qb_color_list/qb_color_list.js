/*!
 * THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
 *
 * This software is released under the MIT License.
 * SPDX-License-Identifier: MIT
 * https://opensource.org/licenses/MIT
 *
 * THIS SOFTWARE IS EXPERIMENTAL, NO GUARANTEES OR LIABILITY ASSUMED.
 *
 */

import { _t } from "@web/core/l10n/translation";

import { Component, signal, proxy, useProps, useListener, t } from "@odoo/owl";

export class QbColorList extends Component {
    static template = "quickboard.QbColorList";

    props = useProps({
        canToggle: t.boolean().optional(true),
        colors: t.array(),
        forceExpanded: t.boolean().optional(false),
        isExpanded: t.boolean().optional(false),
        onColorSelected: t.function(),
        selectedColor: t.number().optional(0),
    });

    setup() {
        this.colorlistRef = signal.ref();
        this.state = proxy({ isExpanded: this.props.isExpanded });
        useListener(window, "click", this.onOutsideClick.bind(this));
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
        if (this.colorlistRef().contains(ev.target) || this.props.forceExpanded) {
            return;
        }
        this.state.isExpanded = false;
    }

    onToggle(ev) {
        if (this.props.canToggle) {
            ev.preventDefault();
            ev.stopPropagation();
            this.state.isExpanded = !this.state.isExpanded;
            this.colorlistRef().firstElementChild.focus();
        }
    }
}
