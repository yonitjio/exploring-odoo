// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
import { TextDialogInput } from "@nuido_base/components/dialogs/text_dialog_input";
import { TextInputDialogInput } from "@nuido_base/components/dialogs/text_input_dialog_input";
export class HttpRequestNode extends Node {
    onUrlChanged(value) {
        this.props.node.url = value;
    }
    onParamsChanged(value) {
        this.props.node.params = value;
    }
    onDataChanged(value) {
        this.props.node.data = value;
    }
    onJsonChanged(value) {
        this.props.node.json = value;
    }
    get methodInputId() {
        return `input-${this.props.node.id}-method`;
    }
}
HttpRequestNode.template = "nuido_flow_sales.http-request-node";
HttpRequestNode.components = {
    ...Node.components,
    TextInputDialogInput,
    TextDialogInput
};
