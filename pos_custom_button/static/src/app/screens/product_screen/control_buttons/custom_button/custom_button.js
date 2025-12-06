/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { Component } from "@odoo/owl";

export class CustomButton extends Component {
    static template = "pos_custom_button.CustomButton";
    static props = {};

    async onClick() {
        console.log("Custom button.");
    }
}
