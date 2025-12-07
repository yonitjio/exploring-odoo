// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { Many2XAutocomplete } from "@web/views/fields/relational_utils";
import { Node } from "@nuido/components/node";
import { ModelSelectorEx } from "@nuido_flow/components/ui/model_selector_ex";
export class RecordMapNode extends Node {
    setup() {
        super.setup();
        this.orm = useService("orm");
        this.state = useState({
            model: this.props.node.model,
            modelDescription: this.props.node.model_description,
            recordId: -1,
            recordName: "",
            mapValue: "",
        });
    }
    resetRecordMapState() {
        this.state.recordId = -1;
        this.state.recordName = "";
        this.state.mapValue = "";
    }
    get keyId() {
        return `input-${this.props.node.id}-key`;
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
        this.state.mapValue = "";
        this.props.node.record_map = [];
        this.refreshEdges();
    }
    onAddRecordMap() {
        if (this.state.recordId > -1 && this.state.model !== "" && this.state.mapValue !== "") {
            this.props.node.addOrUpdateRecordMap(this.state.recordId, this.state.recordName, this.state.mapValue);
            this.refreshEdges();
            this.resetRecordMapState();
        }
    }
    onRemoveRecordMap(id) {
        this.props.node.removeRecordMap(id);
        this.refreshEdges();
    }
    get many2XAutocompleteProps() {
        return {
            value: this.state.recordName,
            id: this.props.id,
            resModel: this.state.model,
            fieldString: this.state.modelDescription,
            autoSelect: true,
            activeActions: {
                create: false,
                createEdit: false,
                write: false,
            },
            update: async (o) => {
                const id = o[0]["id"];
                const fields = ["display_name"];
                const records = await this.orm.read(this.state.model, [id], fields);
                this.state.recordId = id;
                this.state.recordName = records[0]["display_name"];
                this.state.mapValue = "";
            },
            getDomain: () => { []; }
        };
    }
    get mapValueId() {
        return `input-${this.props.node.id}-map-value`;
    }
}
RecordMapNode.template = "nuido_flow_data.record-map-node";
RecordMapNode.components = {
    ...Node.components,
    Many2XAutocomplete,
    ModelSelectorEx
};
