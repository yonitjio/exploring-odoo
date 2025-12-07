// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { onMounted } from "@odoo/owl";
import { useBus } from "@web/core/utils/hooks";
import { Node } from "@nuido/components/node";
import { ModelFieldTags } from "@nuido_flow/components/ui/model_field_tags";
import { DocumentDataUpdatedEventType } from "@nuido_flow_trigger/components/triggers/events";
export class ActiveDataNode extends Node {
    setup() {
        super.setup();
        onMounted(() => {
            this._updatePropsModel();
        });
        useBus(this.env.nbus, this.env.channel + DocumentDataUpdatedEventType, this.onDocumentDataUpdated.bind(this));
    }
    _updatePropsModel() {
        const currentDoc = this.env.documents[this.env.documents.length - 1];
        this.props.node.model = currentDoc.data["activeModel"];
        this.props.node.model_description = currentDoc.data["activeModelDisplayName"];
        if (this.props.node.model === "") {
            this.props.node.fields = [];
        }
        this.refreshEdges();
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
    onDocumentDataUpdated() {
        this._updatePropsModel();
    }
    get modelSelectorId() {
        return `input-${this.props.node.id}-model-selector`;
    }
}
ActiveDataNode.template = "nuido_flow_data.active-data-node";
ActiveDataNode.components = {
    ...Node.components,
    ModelFieldTags
};
