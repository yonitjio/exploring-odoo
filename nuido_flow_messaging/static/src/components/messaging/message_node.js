/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { Node } from "@nuido/components/node";
import { TextDialogInput } from "@nuido_base/components/dialogs/text_dialog_input";
export class MessageNode extends Node {
    static template = "nuido_flow_messaging.message-node";
    static components = {
        ...Node.components,
        TextDialogInput
    };
    onTemplateChanged(value) {
        this.props.node.template = value;
    }
}
