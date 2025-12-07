// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { onMounted, useState } from "@odoo/owl";
import { useBus } from "@web/core/utils/hooks";
import { Node } from "@nuido/components/node";
import { DocumentDataUpdatedEventType } from "@nuido_flow_trigger/components/triggers/events";
import { ModelFieldSelectorEx } from "@nuido_flow/components/ui/model_field_selector_ex";
export class UpdateActiveDataNode extends Node {
    setup() {
        super.setup();
        onMounted(() => {
            this._updatePropsModel();
        });
        this.state = useState({
            fieldName: "",
            fieldValue: ""
        });
        useBus(this.env.nbus, this.env.channel + DocumentDataUpdatedEventType, this.onDocumentDataUpdated.bind(this));
    }
    resetFieldState() {
        this.state.fieldName = "";
        this.state.fieldValue = "";
    }
    _updatePropsModel() {
        const currentDoc = this.env.documents[this.env.documents.length - 1];
        if (currentDoc.data["activeModel"] === "") {
            this.state.fieldName = "";
            this.state.fieldValue = "";
            this.props.node.fields = [];
        }
        this.props.node.model = currentDoc.data["activeModel"] ? currentDoc.data["activeModel"] : "";
        this.props.node.model_description = currentDoc.data["activeModelDisplayName"] ? currentDoc.data["activeModelDisplayName"] : "";
        this.refreshEdges();
    }
    onDocumentDataUpdated() {
        this._updatePropsModel();
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
        this.props.node.removeRecordMap(name);
        this.refreshEdges();
    }
    get fieldValueId() {
        return `input-${this.props.node.id}}-field-value`;
    }
}
UpdateActiveDataNode.template = "nuido_flow_data.update-active-data-node";
UpdateActiveDataNode.components = {
    ...Node.components,
    ModelFieldSelectorEx
};
