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
import { ModelFieldSelectorEx } from "@nuido_flow/components/ui/model_field_selector_ex";
import { TextInputDialogInput } from "@nuido_base/components/dialogs/text_input_dialog_input";
export class UpdateDataNode extends Node {
    setup() {
        super.setup();
        this.state = useState({
            model: this.props.node.model,
            modelDescription: this.props.node.model_description,
            fieldName: "",
            fieldValue: ""
        });
    }
    onIdsChanged(value) {
        this.props.node.ids = value;
    }
    resetFieldState() {
        this.state.fieldName = "";
        this.state.fieldValue = "";
    }
    onModelSelected(model) {
        const { label, technical: value } = model;
        this.props.node.fields = [];
        this.state.model = value;
        this.state.modelDescription = label;
        this.props.node.model = value;
        this.props.node.model_description = label;
    }
    async onModelFieldUpdate(path, info) {
        this.state.fieldName = info.fieldDef ? info.fieldDef.name : "";
        this.refreshEdges();
    }
    onAddField() {
        if (this.state.fieldName !== "" && this.state.fieldValue !== "") {
            this.props.node.addOrUpdateField(this.state.fieldName, this.state.fieldValue);
            this.refreshEdges();
            this.resetFieldState();
        }
    }
    onRemoveField(name) {
        this.props.node.removeField(name);
        this.refreshEdges();
    }
    get modelSelectorId() {
        return `input-${this.props.node.id}}-model-selector`;
    }
    get fieldValueId() {
        return `input-${this.props.node.id}}-field-value`;
    }
}
UpdateDataNode.template = "nuido_flow_data.update-data-node";
UpdateDataNode.components = {
    ...Node.components,
    ModelSelectorEx,
    ModelFieldSelectorEx,
    TextInputDialogInput
};
