// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useRef, onMounted, onWillUnmount } from "@odoo/owl";
import { useBus } from "@web/core/utils/hooks";
import { useDebounced, useThrottleForAnimation } from "@web/core/utils/timing";
import { registry } from "@web/core/registry";
import { uuidv4 } from "@nuido/utils/utils";
import { Edge } from "@nuido/components/edge";
import { DebugEventType, EdgeTypeEventType, AdjustEdgeEndpointEventType, NodeMovedEventType, RemoveEdgeEventType, EdgeCompletedEventType } from "@nuido/components/events";
import { DocumentModel } from "@nuido/models/document";
import { NuidoNodeRegistryName } from "@nuido/utils/registry";
export class Document extends Component {
    static template = "nuido.document";
    static props = {
        document: DocumentModel
    };
    rootRef;
    setup() {
        this.rootRef = useRef("root");
        useBus(this.env.nbus, this.env.channel + "/new" /* DocumentEventType.new */, this.onNewNode.bind(this));
        useBus(this.env.nbus, this.env.channel + NodeMovedEventType, this.onNodeMoved.bind(this));
        useBus(this.env.nbus, this.env.channel + "/delete" /* DocumentEventType.delete */, this.onDeleteSelected.bind(this));
        useBus(this.env.nbus, this.env.channel + "/reset" /* DocumentEventType.reset */, this.onReset.bind(this));
        useBus(this.env.nbus, this.env.channel + EdgeTypeEventType, this.onEdgeTypeChanged.bind(this));
        useBus(this.env.nbus, this.env.channel + "/toggle" /* SelectionEventType.toggle */, this.onToggleSelection.bind(this));
        useBus(this.env.nbus, this.env.channel + "/select" /* SelectionEventType.select */, this.onSelect.bind(this));
        useBus(this.env.nbus, this.env.channel + "/unselect" /* SelectionEventType.unselect */, this.onUnselect.bind(this));
        useBus(this.env.nbus, this.env.channel + "/clear" /* SelectionEventType.clear */, this.onClearSelected.bind(this));
        useBus(this.env.nbus, this.env.channel + "/edge-start" /* NewEdgeEventType.start */, this.onStartConnect.bind(this));
        useBus(this.env.nbus, this.env.channel + "/edge-end" /* NewEdgeEventType.end */, this.onEndConnect.bind(this));
        useBus(this.env.nbus, this.env.channel + AdjustEdgeEndpointEventType, this.onAdjustEdgeEndpoint.bind(this));
        useBus(this.env.nbus, this.env.channel + DebugEventType, this.onDebug.bind(this));
        this.onMouseUp = useDebounced(this.onMouseUp, "animationFrame");
        this.onMouseMove = useThrottleForAnimation(this.onMouseMove);
        onMounted(() => {
            document.addEventListener("mousemove", this.onMouseMove.bind(this));
            document.addEventListener("mouseup", this.onMouseUp.bind(this));
        });
        onWillUnmount(() => {
            document.removeEventListener("mousemove", this.onMouseMove.bind(this));
            document.removeEventListener("mouseup", this.onMouseUp.bind(this));
        });
    }
    get edgeComponent() {
        return Edge;
    }
    onEdgeTypeChanged(event) {
        const doc = this.props.document;
        doc.edgeType = event.detail.edgeType;
        doc.auxEdgeType = event.detail.auxEdgeType;
    }
    getNodeComponent(nodeType) {
        const res = registry.category(NuidoNodeRegistryName).get(nodeType).component;
        return res;
    }
    onNewNode(event) {
        const icon = event.detail.icon;
        const title = event.detail.title;
        const nodeType = event.detail.type;
        const x = event.detail.x;
        const y = event.detail.y;
        const id = uuidv4();
        const doc = this.props.document;
        doc.addNode(id, icon, title, nodeType, x, y);
    }
    onNodeMoved(event) {
        const doc = this.props.document;
        if (doc.selected.findIndex(o => o.id === event.detail.id) > -1) {
            const selectedNodes = doc.selected.filter(o => (o.id !== event.detail.id) && (o.type === "node" /* SelectionType.node */));
            for (let i = 0; i < selectedNodes.length; i++) {
                const node = doc.nodes.find(o => o.id === selectedNodes[i].id);
                node.move(event.detail.x, event.detail.y);
            }
            const selectedJoints = doc.selected.filter(o => (o.id !== event.detail.id) && (o.type === "joint" /* SelectionType.joint */));
            for (let i = 0; i < selectedJoints.length; i++) {
                for (let j = 0; j < doc.edges.length; j++) {
                    doc.edges[j].moveJoint(selectedJoints[i].id, event.detail.x, event.detail.y);
                }
            }
        }
    }
    clearSelected() {
        let els = document.getElementsByClassName("selected");
        while (els.length > 0) {
            els[0].classList.remove("selected");
            els = document.getElementsByClassName("selected");
        }
        const doc = this.props.document;
        doc.clearSelected();
    }
    onClearSelected() {
        this.clearSelected();
    }
    onToggleSelection(event) {
        this.clearSelected();
        const el = document.getElementById(event.detail.id);
        if (el) {
            el.classList.toggle("selected");
            const doc = this.props.document;
            doc.toggleSelect(event.detail.type, event.detail.id);
        }
    }
    onSelect(event) {
        const el = document.getElementById(event.detail.id);
        if (el) {
            el.classList.add("selected");
            const doc = this.props.document;
            doc.select(event.detail.type, event.detail.id);
        }
        else {
            this.clearSelected();
        }
    }
    onUnselect(event) {
        const el = document.getElementById(event.detail.id);
        if (el) {
            el.classList.remove("selected");
            const doc = this.props.document;
            doc.unselect(event.detail.id);
        }
        else {
            this.clearSelected();
        }
    }
    onDeleteSelected() {
        const doc = this.props.document;
        for (let i = 0; i < doc.selected.length; i++) {
            if (doc.selected[i]) {
                if (doc.selected[i].type === "edge" /* SelectionType.edge */) {
                    const edge = doc.edges.find(o => o.id === doc.selected[i].id);
                    if (edge) {
                        this.env.nbus.trigger(this.env.channel + RemoveEdgeEventType, {
                            id: edge.id
                        });
                    }
                }
            }
        }
        ;
        doc.deleteSelected();
        this.clearSelected();
    }
    onReset() {
        const doc = this.props.document;
        doc.reset();
    }
    onStartConnect(event) {
        const id = uuidv4();
        const portId = event.detail.id;
        const direction = event.detail.direction;
        const nodeId = event.detail.nodeId;
        const doc = this.props.document;
        let edgeType;
        if (direction === "output" /* PortDirection.out */) {
            edgeType = doc.edgeType;
        }
        else {
            edgeType = doc.auxEdgeType;
        }
        doc.startEdge(id, edgeType, portId, nodeId, event.detail.x, event.detail.y);
    }
    onEndConnect(event) {
        const portId = event.detail.id;
        const nodeId = event.detail.nodeId;
        const doc = this.props.document;
        const edge = doc.endEdge(portId, nodeId, event.detail.x, event.detail.y);
        if (edge) {
            this.env.nbus.trigger(this.env.channel + EdgeCompletedEventType, {
                id: edge.id,
                inNodeId: edge.inNodeId,
                outNodeId: edge.outNodeId,
            });
        }
    }
    onAdjustEdgeEndpoint(event) {
        const portId = event.detail.id;
        const nodeId = event.detail.nodeId;
        const direction = event.detail.direction;
        const doc = this.props.document;
        doc.adjustEdgeEndpoint(portId, direction, nodeId, event.detail.x, event.detail.y);
    }
    onMouseMove(event) {
        const doc = this.props.document;
        if (doc && doc.newEdge !== undefined) {
            const docElement = document.querySelector(".nuido-doc");
            const docRect = docElement.getBoundingClientRect();
            const x = (event.clientX - docRect.left) / this.env.ui.zoom;
            const y = (event.clientY - docRect.top) / this.env.ui.zoom;
            doc.updateNewEdge(x, y);
        }
    }
    onMouseUp(event) {
        const doc = this.props.document;
        if (doc && doc.newEdge !== undefined) {
            if (event.button == 0) {
                const docElement = document.querySelector(".nuido-doc");
                const docRect = docElement.getBoundingClientRect();
                const evX = event.clientX;
                const evY = event.clientY;
                const x = (evX - docRect.left) / this.env.ui.zoom;
                const y = (evY - docRect.top) / this.env.ui.zoom;
                const path = doc.newEdge.paths[doc.newEdge.paths.length - 1];
                doc.newEdge.createJoint(path, x, y, doc.newEdge.joints.length - 1);
            }
            else {
                doc.clearNewEdge();
            }
        }
    }
    onDebug(event) {
        console.log("debug");
    }
}
