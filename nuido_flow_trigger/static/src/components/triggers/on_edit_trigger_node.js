// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState } from "@odoo/owl";
import { ModelFieldTags } from "@nuido_flow/components/ui/model_field_tags";
import { ModelSelectorEx } from "@nuido_flow/components/ui/model_selector_ex";
import { OnRecordOperationTriggerNode } from "@nuido_flow_trigger/components/triggers/record_op_trigger_node";
export class OnEditTriggerNode extends OnRecordOperationTriggerNode {
    setup() {
        super.setup();
        this.state = useState({
            model: this.props.node.model,
            modelDescription: this.props.node.model_description
        });
    }
    get modelSelectorId() {
        return `input-${this.props.node.id}-model-selector`;
    }
    getDomain() {
        return [];
    }
    onModelSelected(model) {
        const { label, technical: value } = model;
        this.state.model = value;
        this.state.modelDescription = label;
        this.props.node.model = value;
        this.props.node.model_description = label;
        this.props.node.fields = [];
        this.refreshEdges();
        this._updateCurrentDocData();
    }
    onFieldDeleted(fieldName) {
        const idx = this.props.node.fields.findIndex(o => o.value === fieldName);
        if (idx > -1) {
            this.props.node.fields.splice(idx, 1);
        }
        this.refreshEdges();
    }
    onFieldAdded(fieldInfo) {
        this.props.node.fields.push(fieldInfo);
        this.refreshEdges();
    }
}
OnEditTriggerNode.template = "nuido_flow_trigger.on-edit-trigger-node";
OnEditTriggerNode.components = {
    ...OnRecordOperationTriggerNode.components,
    ModelSelectorEx,
    ModelFieldTags
};
