import { useState } from "@odoo/owl";
import { Node } from "@nuido/components/node";
import { ModelSelectorEx } from "@nuido_flow/components/ui/model_selector_ex";
import { ModelFieldSelectorEx } from "@nuido_flow/components/ui/model_field_selector_ex";
import { TextInputDialogInput } from "@nuido_base/components/dialogs/text_input_dialog_input";
export class BrowseDataNode extends Node {
    static template = "nuido_flow_data.browse-data-node";
    static components = {
        ...Node.components,
        ModelSelectorEx,
        ModelFieldSelectorEx,
        TextInputDialogInput
    };
    state;
    setup() {
        super.setup();
        this.state = useState({
            model: this.props.node.model,
            modelDescription: this.props.node.model_description
        });
    }
    onModelSelected(model) {
        const { label, technical: value } = model;
        this.state.model = value;
        this.state.modelDescription = label;
        this.props.node.model = value;
        this.props.node.model_description = label;
        this.refreshEdges();
    }
    onReferenceFieldUpdate(path, info) {
        this.props.node.reference_field = info.fieldDef ? info.fieldDef.name : "";
        this.refreshEdges();
    }
    onReferenceValueChanged(value) {
        this.props.node.reference_values = value;
    }
    get modelSelectorId() {
        return `input-${this.props.node.id}-model-selector`;
    }
}
