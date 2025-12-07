/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { QbColorList } from "../../../core/qb_color_list/qb_color_list";

import { user } from "@web/core/user";
import { Component } from "@odoo/owl";

import { QUICKBOARD_BG_COLORS, QUICKBOARD_FG_COLORS } from "../../../core/colors";

export class QbColorPickerField extends Component {
    static template = "quickboard.QbColorPickerField";
    static components = {
        QbColorList,
    };
    static props = {
        ...standardFieldProps,
        canToggle: { type: Boolean },
        mode: { type: String },
    };

    currentColorPalette() {
        let theme = user.settings.quickboard_theme;
        if (this.props.mode === "foreground"){
            return QUICKBOARD_FG_COLORS[theme];
        } else {
            return QUICKBOARD_BG_COLORS[theme];
        }
    }

    get isExpanded() {
        return !this.props.canToggle && !this.props.readonly;
    }

    switchColor(colorIndex) {
        this.props.record.update({ [this.props.name]: colorIndex });
    }
}

export const qbColorPickerField = {
    component: QbColorPickerField,
    supportedTypes: ["integer"],
    supportedOptions: [
        {
            label: _t("Mode"),
            name: "mode",
            type: "selection",
            choices: [
                { label: "Foreground", value: "fg" },
                { label: "Background", value: "bg" },
            ],
            default: "bg",
        },
    ],
    extractProps: ({ options, viewType }) => ({
        canToggle: viewType !== "list",
        mode: options.mode,
    }),
};

registry.category("fields").add("qb_color_picker", qbColorPickerField);
