// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState } from "@odoo/owl";
import { Node } from "@nuido/components/node";
import { ModelSelectorEx } from "@nuido_flow/components/ui/model_selector_ex";
export class CustomFieldStarterNode extends Node {
    setup() {
        super.setup();
        this.state = useState({
            model: this.props.node.model,
            modelDescription: this.props.node.model_description
        });
    }
    onModelSelected(model) {
        const { label, technical: value } = model;
        this.props.node.fields = [];
        this.state.model = value;
        this.state.modelDescription = label;
        this.props.node.model = value;
        this.props.node.model_description = label;
    }
    onRemoveFieldChanged() {
        if (this.props.node.remove_field) {
            this.props.node.remove_field = false;
        }
        else {
            this.props.node.remove_field = true;
        }
    }
    get modelSelectorId() {
        return `input-${this.props.node.id}-model-selector`;
    }
    get removeFieldInputId() {
        return `input-${this.props.node.id}-remove-field`;
    }
}
CustomFieldStarterNode.template = "nuido_flow.custom-field-starter-node";
CustomFieldStarterNode.components = {
    ...Node.components,
    ModelSelectorEx,
};
