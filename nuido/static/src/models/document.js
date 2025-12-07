// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { omit } from "@web/core/utils/objects";
import { NuidoEdgeRegistryName, NuidoNodeRegistryName } from "@nuido/utils/registry";
import { JointModel } from "@nuido/models/joint";
import { SectionedNodeModel } from "@nuido/models/sectioned_node";
import { removeItem } from "@nuido/utils/utils";
export var SelectionType;
(function (SelectionType) {
    SelectionType["node"] = "node";
    SelectionType["edge"] = "edge";
    SelectionType["joint"] = "joint";
})(SelectionType || (SelectionType = {}));
export class DocumentModel {
    id;
    title;
    sessionId;
    isProcessed;
    nodes;
    edges;
    newEdge;
    edgeType;
    auxEdgeType;
    selected;
    data;
    constructor(id, sessionId, title) {
        this.id = id;
        this.title = title;
        this.sessionId = sessionId;
        this.isProcessed = false;
        this.nodes = [];
        this.edges = [];
        this.selected = [];
        this.newEdge = undefined;
        this.edgeType = undefined;
        this.auxEdgeType = undefined;
        this.data = {};
    }
    _addNode(id, icon, title, nodeType, left, top) {
        const nodeRegistry = registry.category(NuidoNodeRegistryName).get(nodeType);
        if (nodeRegistry && nodeRegistry.model) {
            const node = new nodeRegistry.model(id, icon, title, nodeType, left, top);
            this.nodes.push(node);
            return node;
        }
        return undefined;
    }
    addNode(id, icon, title, nodeType, left, top) {
        const node = this._addNode(id, icon, title, nodeType, left, top);
        if (node) {
            node.setup();
        }
        return node;
    }
    loadNode(id, icon, title, nodeType, left, top) {
        return this._addNode(id, icon, title, nodeType, left, top);
    }
    removeNode(id) {
        const node = this.nodes.find(o => o.id === id);
        const edges = node.getLinkedEdges();
        node.resetPorts();
        edges.forEach(edge => {
            this.removeEdge(edge.id);
        });
        removeItem(this.nodes, id);
    }
    removeEdge(id) {
        const edgeIdx = this.edges.findIndex(o => o.id === id);
        if (edgeIdx > -1) {
            const edge = this.edges[edgeIdx];
            const outNode = this.nodes.find(o => o.id === edge.outNodeId);
            const inNode = this.nodes.find(o => o.id === edge.inNodeId);
            outNode.removeOutput(edge.outPortId, id);
            inNode.removeInput(edge.inPortId, id);
            removeItem(this.edges, id);
        }
    }
    addEdge(edge) {
        this.edges.push(edge);
        return edge;
    }
    toggleSelect(type, id) {
        this.clearSelected();
        this.selected.push({
            id: id,
            type: type
        });
    }
    select(type, id) {
        const i = this.selected.findIndex(o => o.id == id);
        if (i > -1)
            return;
        this.selected.push({
            id: id,
            type: type
        });
    }
    unselect(id) {
        const i = this.selected.findIndex(o => o.id == id);
        if (i > -1) {
            this.selected.splice(i, 1);
        }
    }
    clearSelected() {
        this.selected = [];
    }
    deleteSelected() {
        if (this.selected) {
            for (let i = 0; i < this.selected.length; i++) {
                const sel = this.selected[i];
                if (sel.type === "edge") {
                    this.removeEdge(sel.id);
                }
                else if (sel.type === 'node') {
                    this.removeNode(sel.id);
                }
            }
            this.clearSelected();
        }
    }
    reset() {
        while (this.nodes.length > 0) {
            const node = this.nodes[0];
            this.removeNode(node.id);
        }
    }
    loadPath(edgeType, id, startX, startY, endX, endY) {
        const edgeRegistry = registry.category(NuidoEdgeRegistryName).get(edgeType);
        if (edgeRegistry && edgeRegistry.model) {
            const path = new edgeRegistry.model.pathClass(id, startX, startY, endX, endY);
            return path;
        }
        return undefined;
    }
    loadEdge(id, edgeType, startX, startY, endX, endY, inPortId, inNodeId, outPortId, outNodeId, paths, joints) {
        const edgeRegistry = registry.category(NuidoEdgeRegistryName).get(edgeType);
        if (edgeRegistry && edgeRegistry.model) {
            const edge = new edgeRegistry.model(id, edgeType, startX, startY, endX, endY, inPortId, inNodeId, outPortId, outNodeId, paths, joints);
            return edge;
        }
        return undefined;
    }
    _startEdge(id, edgeType, portId, nodeId, x, y) {
        const edgeRegistry = registry.category(NuidoEdgeRegistryName).get(edgeType);
        if (edgeRegistry && edgeRegistry.model) {
            const edge = new edgeRegistry.model(id, edgeType, x, y, x, y, null, null, portId, nodeId);
            return edge;
        }
        return undefined;
    }
    startEdge(id, edgeType, portId, nodeId, x, y) {
        this.clearSelected();
        const node = this.nodes.find(o => o.id === nodeId);
        const port = node.outPorts.find(p => p.id === portId);
        const auxPort = node.auxOutPorts.find(p => p.id === portId);
        if ((port && node.canAddOutput(portId) || (auxPort && node.canAddAuxOut(portId)))) {
            this.newEdge = this._startEdge(id, edgeType, portId, nodeId, x, y);
            return this.newEdge;
        }
        return null;
    }
    updateNewEdge(x, y) {
        this.newEdge.updateEndPos(x, y);
    }
    endEdge(portId, nodeId, x, y) {
        if (this.newEdge !== undefined) {
            const edge = this.newEdge;
            const outNode = this.nodes.find(o => o.id === edge.outNodeId);
            const node = this.nodes.find(o => o.id === nodeId);
            if (outNode.id === node.id)
                return;
            const isInPort = node.inPorts.findIndex(o => o.id === portId) > -1;
            const isAuxInPort = node.auxInPorts.findIndex(o => o.id === portId) > -1;
            if (isInPort || isAuxInPort) {
                edge.vprops.endX = x;
                edge.vprops.endY = y;
                edge.inPortId = portId;
                edge.inNodeId = nodeId;
                const inNode = this.nodes.find(o => o.id === edge.inNodeId);
                if (isInPort) {
                    const canAddInput = node.canAddInput(portId, this.newEdge, outNode);
                    if (canAddInput) {
                        outNode.addOutput(edge.outPortId, edge);
                        inNode.addInput(edge.inPortId, edge);
                        this.edges.push(edge);
                        this.clearNewEdge();
                    }
                }
                else {
                    const canAddAuxIn = node.canAddAuxIn(portId, this.newEdge, outNode);
                    if (canAddAuxIn) {
                        outNode.addAuxOut(edge.outPortId, edge);
                        inNode.addAuxIn(edge.inPortId, edge);
                        this.edges.push(edge);
                        this.clearNewEdge();
                    }
                }
            }
            return edge;
        }
    }
    clearNewEdge() {
        this.newEdge = undefined;
    }
    adjustEdgeEndpoint(portId, direction, nodeId, x, y) {
        const node = this.nodes.find(o => o.id == nodeId);
        if (node) {
            if (direction === "input" /* PortDirection.in */) {
                const port = node.inPorts.find(o => o.id == portId);
                if (port) {
                    for (let i = 0; i < port.links.length; i++) {
                        Object.assign(port.links[i].vprops, {
                            endX: x,
                            endY: y
                        });
                    }
                }
            }
            else if (direction === "output" /* PortDirection.out */) {
                const port = node.outPorts.find(o => o.id == portId);
                if (port) {
                    for (let i = 0; i < port.links.length; i++) {
                        Object.assign(port.links[i].vprops, {
                            startX: x,
                            startY: y
                        });
                    }
                }
            }
            else if (direction === "aux-in" /* PortDirection.auxIn */) {
                const port = node.auxInPorts.find(o => o.id == portId);
                if (port) {
                    for (let i = 0; i < port.links.length; i++) {
                        Object.assign(port.links[i].vprops, {
                            endX: x,
                            endY: y
                        });
                    }
                }
            }
            else if (direction === "aux-out" /* PortDirection.auxOut */) {
                const port = node.auxOutPorts.find(o => o.id == portId);
                if (port) {
                    for (let i = 0; i < port.links.length; i++) {
                        Object.assign(port.links[i].vprops, {
                            startX: x,
                            startY: y
                        });
                    }
                }
            }
        }
    }
    toJson(full = true) {
        if (full) {
            return JSON.stringify(this, (key, value) => {
                if (key === "links") {
                    return undefined;
                }
                else {
                    return value;
                }
            }, 4);
        }
        else {
            const excluded = [
                "vprops", "lastVprops", "edgeType", "joints", "links", "paths",
                "left", "top", "nodeId", "maxLinks", "spec"
            ];
            return JSON.stringify(this, (key, value) => {
                if (excluded.includes(key)) {
                    return undefined;
                }
                else {
                    return value;
                }
            }, 4);
        }
    }
    fromJson(json) {
        this.reset();
        const jsonObj = JSON.parse(json);
        this.id = jsonObj.id;
        this.title = jsonObj.title;
        this.isProcessed = jsonObj.isProcessed;
        jsonObj["nodes"].forEach((n) => {
            const node = this.loadNode(n.id, n.icon, n.title, n.nodeType, n.vprops.left, n.vprops.top);
            const nProps = omit(n, "id", "icon", "title", "nodeType", "inPorts", "outPorts", "auxInPorts", "auxOutPorts", "sections", "vprops"); //omit(n, ...Object.keys(node))
            Object.assign(node, nProps);
            n.inPorts.forEach((p) => {
                node.addInPort(p.id, p.portType, p.maxLinks, p.spec);
            });
            n.outPorts.forEach(p => {
                node.addOutPort(p.id, p.portType, p.maxLinks, p.spec);
            });
            n.auxInPorts.forEach(p => {
                node.addAuxInPort(p.id, p.portType, p.maxLinks, p.spec);
            });
            n.auxOutPorts.forEach(p => {
                node.addAuxOutPort(p.id, p.portType, p.maxLinks, p.spec);
            });
            if (node instanceof SectionedNodeModel) {
                const sn = n;
                sn.sections.forEach((s) => {
                    const section = node.loadSection(s.id, s.sectionType, s.direction, s.inPortId, s.outPortId);
                    const sProps = omit(s, "id", "sectionType", "inPortId", "outPortId", "direction", "maxIn", "maxOut");
                    Object.assign(section, sProps);
                });
            }
        });
        jsonObj["edges"].forEach((e) => {
            const paths = [];
            e.paths.forEach((p) => {
                const path = this.loadPath(e.edgeType, p.id, p.vprops.startX, p.vprops.startY, p.vprops.endX, p.vprops.endY);
                paths.push(path);
            });
            const joints = [];
            e.joints.forEach(j => {
                const joint = new JointModel(j.id, j.vprops.cX, j.vprops.cY, j.vprops.r, j.startPathId, j.endPathId);
                joints.push(joint);
            });
            const edge = this.loadEdge(e.id, e.edgeType, e.vprops.startX, e.vprops.startY, e.vprops.endX, e.vprops.endY, e.inPortId, e.inNodeId, e.outPortId, e.outNodeId, paths, joints);
            const outNode = this.nodes.find(o => o.id === edge.outNodeId);
            let port = outNode.outPorts.find(o => o.id === edge.outPortId);
            if (port) {
                port.addLink(edge);
            }
            else {
                port = outNode.auxOutPorts.find(o => o.id === edge.outPortId);
                port.addLink(edge);
            }
            const inNode = this.nodes.find(o => o.id === edge.inNodeId);
            port = inNode.inPorts.find(o => o.id === edge.inPortId);
            if (port) {
                port.addLink(edge);
            }
            else {
                port = inNode.auxInPorts.find(o => o.id === edge.inPortId);
                port.addLink(edge);
            }
            this.addEdge(edge);
        });
    }
}
