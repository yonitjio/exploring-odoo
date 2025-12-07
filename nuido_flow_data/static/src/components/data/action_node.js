// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { Node } from "@nuido/components/node";
import { ModelSelectorEx } from "@nuido_flow/components/ui/model_selector_ex";
import { Many2XAutocomplete } from "@web/views/fields/relational_utils";
import { TextInputDialogInput } from "@nuido_base/components/dialogs/text_input_dialog_input";
export class ActionNode extends Node {
    setup() {
        super.setup();
        this.orm = useService("orm");
        this.state = useState({
            model: this.props.node.model,
            modelDescription: this.props.node.model_description,
            recordId: this.props.node.action.id,
            recordName: this.props.node.action.display_name,
        });
    }
    resetRecordMapState() {
        this.state.recordId = -1;
        this.state.recordName = "";
    }
    get modelSelectorId() {
        return `input-${this.props.node.id}-model-selector`;
    }
    onModelSelected(model) {
        const { label, technical: value } = model;
        this.state.model = value;
        this.state.modelDescription = label;
        this.props.node.model = value;
        this.props.node.model_description = label;
        this.state.recordId = -1;
        this.state.recordName = "";
        this.props.node.action = {
            id: -1,
            display_name: ""
        };
        this.refreshEdges();
    }
    onIdsChanged(value) {
        this.props.node.ids = value;
    }
    get many2XAutocompleteProps() {
        const ir_action_server = 'ir.actions.server';
        return {
            value: this.state.recordName,
            id: this.props.id,
            resModel: 'ir.actions.server',
            fieldString: "Action",
            autoSelect: true,
            activeActions: {
                create: false,
                createEdit: false,
                write: false,
            },
            update: async (o) => {
                const id = o[0]["id"];
                const fields = ["display_name"];
                const records = await this.orm.read(ir_action_server, [id], fields);
                this.state.recordId = id;
                this.state.recordName = records[0]["display_name"];
                this.props.node.action = {
                    id: id,
                    display_name: records[0]["display_name"]
                };
            },
            getDomain: () => {
                return [
                    ["model_name", "=", this.state.model]
                ];
            }
        };
    }
}
ActionNode.template = "nuido_flow_data.action-node";
ActionNode.components = {
    ...Node.components,
    Many2XAutocomplete,
    ModelSelectorEx,
    TextInputDialogInput
};
