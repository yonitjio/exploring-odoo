// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { ModelSelectorEx } from "@nuido_flow/components/ui/model_selector_ex";
import { OnRecordOperationTriggerNode } from "@nuido_flow_trigger/components/triggers/record_op_trigger_node";
export class OnDeleteTriggerNode extends OnRecordOperationTriggerNode {
    get modelSelectorId() {
        return `input-${this.props.node.id}-model-selector`;
    }
    onModelSelected(model) {
        const { label, technical: value } = model;
        this.props.node.model = value;
        this.props.node.model_description = label;
        this._updateCurrentDocData();
    }
}
OnDeleteTriggerNode.template = "nuido_flow_trigger.on-delete-trigger-node";
OnDeleteTriggerNode.components = {
    ...OnRecordOperationTriggerNode.components,
    ModelSelectorEx
};
