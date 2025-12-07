/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { SelectMenu } from "@web/core/select_menu/select_menu";
import { Component } from "@odoo/owl";

import { fa_icons } from "./fa_icons";

export class QbIconPickerField extends Component {
    static template = "quickboard.QbIconPickerField";
    static components = {
        SelectMenu,
    };
    static props = {
        ...standardFieldProps,
    };

    async onSelectIcon(val) {
        this.props.record.update({ [this.props.name]: val });
    }

    get icons() {
        return fa_icons;
    }

}

export const qbIconPickerField = {
    component: QbIconPickerField,
    supportedTypes: ["char"],
};

registry.category("fields").add("qb_icon_picker", qbIconPickerField);
