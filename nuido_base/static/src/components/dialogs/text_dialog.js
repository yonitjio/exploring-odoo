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
export class TextDialog extends Component {
    static template = "nuido_base.text-dialog";
    static components = { Dialog };
    static props = {
        title: String,
        initialValue: String,
        apply: Function,
        close: Function,
    };
    state;
    setup() {
        this.state = useState({
            text: this.props.initialValue
        });
    }
    onClickApply() {
        this.props.apply(this.state.text);
        this.props.close();
    }
}
