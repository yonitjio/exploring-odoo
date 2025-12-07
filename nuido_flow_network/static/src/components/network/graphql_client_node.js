// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
import { TextInputDialogInput } from "@nuido_base/components/dialogs/text_input_dialog_input";
import { TextDialogInput } from "@nuido_base/components/dialogs/text_dialog_input";
export class GraphQlClientNode extends Node {
    onUrlChanged(value) {
        this.props.node.url = value;
    }
    onQueryChanged(value) {
        this.props.node.query = value;
    }
}
GraphQlClientNode.template = "nuido_flow_sales.graphql-client-node";
GraphQlClientNode.components = {
    ...Node.components,
    TextInputDialogInput,
    TextDialogInput
};
