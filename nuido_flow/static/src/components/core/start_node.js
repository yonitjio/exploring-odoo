// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
import { TextDialogInput } from "@nuido_base/components/dialogs/text_dialog_input";
export class StartNode extends Node {
    onParametersChanged(value) {
        this.props.node.parameters = value;
    }
}
StartNode.template = "nuido_flow.start-node";
StartNode.components = {
    ...Node.components,
    TextDialogInput
};
