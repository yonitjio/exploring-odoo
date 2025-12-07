// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
import { TextDialogInput } from "@nuido_base/components/dialogs/text_dialog_input";
export class ManualResponseNode extends Node {
    onMessageChanged(value) {
        this.props.node.message = value;
    }
}
ManualResponseNode.template = "nuido_flow_ai_chat.manual-response-node";
ManualResponseNode.components = {
    ...Node.components,
    TextDialogInput
};
