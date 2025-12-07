// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
import { TextDialogInput } from "@nuido_base/components/dialogs/text_dialog_input";
export class NotifyNode extends Node {
    onTemplateChanged(value) {
        this.props.node.template = value;
    }
    onStickyChanged() {
        if (this.props.node.sticky) {
            this.props.node.sticky = false;
        }
        else {
            this.props.node.sticky = true;
        }
    }
    get stickyInputId() {
        return `label-${this.props.node.id}-sticky`;
    }
}
NotifyNode.template = "nuido_flow_messaging.notify-node";
NotifyNode.components = {
    ...Node.components,
    TextDialogInput
};
