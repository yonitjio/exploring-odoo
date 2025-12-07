// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
import { TextDialogInput } from "@nuido_base/components/dialogs/text_dialog_input";
export class JinjaNode extends Node {
    onTemplateChanged(value) {
        this.props.node.template = value;
    }
    onAsDictionaryChanged() {
        if (this.props.node.as_dictionary) {
            this.props.node.as_dictionary = false;
        }
        else {
            this.props.node.as_dictionary = true;
        }
    }
    get asDictionaryInputId() {
        return `label-${this.props.node.id}-as-dictionary`;
    }
}
JinjaNode.template = "nuido_flow_jinja.jinja-node";
JinjaNode.components = {
    ...Node.components,
    TextDialogInput
};
