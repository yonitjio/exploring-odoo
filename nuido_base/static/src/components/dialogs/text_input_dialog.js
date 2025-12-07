// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
export class TextInputDialog extends Component {
    setup() {
        this.state = useState({
            text: this.props.initialValue,
            type: this.props.hidable ? "password" : "text"
        });
    }
    onTogglePasswordClick() {
        this.state.type = this.state.type === "password" ? "text" : "password";
    }
    onClickApply() {
        if (this.state.text.trim() !== "") {
            this.props.apply(this.state.text);
            this.props.close();
        }
        else {
            const docNameEl = document.getElementById("document-name");
            docNameEl.classList.add("is-invalid");
        }
    }
}
TextInputDialog.template = "nuido_base.text-input-dialog";
TextInputDialog.components = { Dialog };
TextInputDialog.props = {
    title: String,
    initialValue: String,
    label: { type: String, optional: true },
    apply: Function,
    close: Function,
    hidable: { type: Boolean, optional: true },
};
TextInputDialog.defaultProps = {
    hidable: false
};
