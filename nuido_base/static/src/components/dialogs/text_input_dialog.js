/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { Component, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
export class TextInputDialog extends Component {
    static template = "nuido_base.text-input-dialog";
    static components = { Dialog };
    static props = {
        title: String,
        initialValue: String,
        label: { type: String, optional: true },
        apply: Function,
        close: Function,
        hidable: { type: Boolean, optional: true },
    };
    static defaultProps = {
        hidable: false
    };
    state;
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
        this.props.apply(this.state.text);
        this.props.close();
    }
}
