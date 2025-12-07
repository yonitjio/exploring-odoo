// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, markup } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
export class ViewJsonDialog extends Component {
    setup() {
    }
    get json() {
        // @ts-ignore
        const markedMessage = hljs.highlight(this.props.json, { language: "json" }).value;
        // @ts-ignore
        const res = markup(DOMPurify.sanitize(markedMessage));
        return res;
    }
}
ViewJsonDialog.template = "nuido_base.view-json-dialog";
ViewJsonDialog.components = { Dialog };
ViewJsonDialog.props = {
    json: String,
    close: Function,
};
