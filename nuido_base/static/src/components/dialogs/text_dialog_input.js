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
import { TextDialog } from "@nuido_base/components/dialogs/text_dialog";
export class TextDialogInput extends Component {
    setup() {
        super.setup();
        this.dialog = useService("dialog");
        const state = {
            value: this.props.value
        };
        this.state = useState(makeReactive(this, state, (owner, data) => {
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
        this.dialog.add(TextDialog, {
            title: this.props.label,
            initialValue: this.props.value,
            apply: this.updateText.bind(this)
        });
    }
}
TextDialogInput.template = "nuido_base.text-dialog-input";
TextDialogInput.props = {
    ...Component.props,
    id: String,
    label: String,
    onChanged: Function,
    value: { type: String, optional: true }
};
TextDialogInput.defaultProps = {
    value: ""
};
