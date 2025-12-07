/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { Component, markup } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
export class ViewJsonDialog extends Component {
    static template = "nuido_base.view-json-dialog";
    static components = { Dialog };
    static props = {
        json: String,
        close: Function,
    };
    setup() {
    }
    get json() {
        const markedMessage = hljs.highlight(this.props.json, { language: "json" }).value;
        const res = markup(DOMPurify.sanitize(markedMessage));
        return res;
    }
}
