// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
import { TextInputDialogInput } from "@nuido_base/components/dialogs/text_input_dialog_input";
export class OwlyHeaderNode extends Node {
    onSecretChanged(value) {
        this.props.node.secret = value;
    }
}
OwlyHeaderNode.template = "nuido_flow_owly.owly-header-node";
OwlyHeaderNode.components = {
    ...Node.components,
    TextInputDialogInput
};
