// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useState } from "@odoo/owl";
import { makeReactive } from "@nuido/utils/utils";
import { useService } from "@web/core/utils/hooks";
import { HtmlDialog } from "@nuido_base/components/dialogs/html_dialog";
export class HtmlDialogInput extends Component {
    setup() {
        super.setup();
        this.dialog = useService("dialog");
        const state = {
            value: this.props.value
        };
        this.state = useState(makeReactive(this, state, (_owner, data) => {
            this.props.onChanged(data.value);
        }));
    }
    get trimmedText() {
        return this.state.value.length > 30 ?
            this.state.value.substring(0, 30) + '...' :
            this.state.value;
    }
    updateText(value) {
        this.state.value = value;
    }
    async showDialog() {
        this.dialog.add(HtmlDialog, {
            id: `input-${this.props.id}-html`,
            title: this.props.label,
            initialValue: this.props.value,
            apply: this.updateText.bind(this)
        });
    }
}
HtmlDialogInput.template = "nuido_base.html-dialog-input";
HtmlDialogInput.props = {
    ...Component.props,
    id: String,
    label: String,
    onChanged: Function,
    value: { type: String, optional: true }
};
HtmlDialogInput.defaultProps = {
    value: ""
};
