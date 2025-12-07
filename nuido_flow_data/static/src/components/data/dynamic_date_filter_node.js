// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useBus } from "@web/core/utils/hooks";
import { Node } from "@nuido/components/node";
import { EdgeCompletedEventType, RemoveEdgeEventType } from "@nuido/components/events";
import { ModelSelectorEx } from "@nuido_flow/components/ui/model_selector_ex";
import { ModelFieldSelectorEx } from "@nuido_flow/components/ui/model_field_selector_ex";
import { UpdateDataModelEventType } from "@nuido_flow_data/components/data/events";
export class DynamicDateFilterNode extends Node {
    setup() {
        super.setup();
        useBus(this.env.nbus, this.env.channel + EdgeCompletedEventType, this.onCompleteConnect.bind(this));
        useBus(this.env.nbus, this.env.channel + RemoveEdgeEventType, this.onRemoveEdge.bind(this));
        useBus(this.env.nbus, this.env.channel + UpdateDataModelEventType, this.onUpdateDataModel.bind(this));
    }
    onUpdateDataModel(event) {
        const auxOutEdges = this.props.node.getAuxOutputEdges();
        const edge = auxOutEdges.find((o) => o.outNodeId === this.props.node.id);
        if (edge) {
            const currentDoc = this.env.documents[this.env.documents.length - 1];
            const dataNode = currentDoc.nodes.find(o => o.id === edge.inNodeId);
            this.props.node.model = dataNode.model;
            this.props.node.model_description = dataNode.model_description;
            this.render();
        }
    }
    onRemoveEdge(event) {
        const currentDoc = this.env.documents[this.env.documents.length - 1];
        const edge = currentDoc.edges.find(o => o.id === event.detail.id);
        if (this.props.node.id === edge.outNodeId) {
            this.props.node.model = "";
            this.props.node.model_description = "";
        }
    }
    onCompleteConnect(event) {
        const outNodeId = event.detail.outNodeId;
        if (this.props.node.id === outNodeId) {
            const currentDoc = this.env.documents[this.env.documents.length - 1];
            const inNode = currentDoc.nodes.find(o => o.id === event.detail.inNodeId);
            this.props.node.model = inNode.model;
            this.props.node.model_description = inNode.model_description;
        }
    }
    dynamicDateFieldFilter(value) {
        return value.searchable && (["date", "datetime"].find(o => o === value.type));
    }
    onDynamicDateFieldUpdate(path, info) {
        this.props.node.dynamic_date_field = info.fieldDef ? info.fieldDef.name : "";
    }
    onDynamicDateIntervalChanged(ev) {
        this.props.node.dynamic_date_interval = ev.target.value;
    }
    get dynamicDateIntervalInputId() {
        return `input-${this.props.node.id}-dynamic-date-interval`;
    }
    get modelSelectorId() {
        return `input-${this.props.node.id}-model-selector`;
    }
}
DynamicDateFilterNode.template = "nuido_flow_data.dynamic-date-filter-node";
DynamicDateFilterNode.components = {
    ...Node.components,
    ModelSelectorEx,
    ModelFieldSelectorEx,
};
