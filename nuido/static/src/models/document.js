/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { registry } from "@web/core/registry";
import { omit } from "@web/core/utils/objects";
import { NuidoEdgeRegistryName, NuidoNodeRegistryName } from "@nuido/utils/registry";
import { JointModel } from "@nuido/models/joint";
import { SectionedNodeModel } from "@nuido/models/sectioned_node";
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
            const node = new nodeRegistry.model({
                id,
                icon,
                title,
                nodeType,
                left,
                top
            });
            this.nodes.push(node);
            return node;
        }
        console.error(`Node type "${nodeType}" not found in registry.`);
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
        const nodeIndex = this.nodes.findIndex(o => o.id === id);
        if (nodeIndex === -1)
            return;
        const node = this.nodes[nodeIndex];
        const edgesToRemove = node.getLinkedEdges();
        edgesToRemove.forEach(edge => {
            this.removeEdge(edge.id);
        });
        this.nodes.splice(nodeIndex, 1);
    }
    removeEdge(id) {
        const edgeIndex = this.edges.findIndex(o => o.id === id);
        if (edgeIndex === -1)
            return;
        const edge = this.edges[edgeIndex];
        const outNode = this.nodes.find(o => o.id === edge.outNodeId);
        const inNode = this.nodes.find(o => o.id === edge.inNodeId);
        if (outNode) {
            outNode.removeOutput(edge.outPortId, id);
            outNode.removeAuxOut(edge.outPortId, id);
        }
        if (inNode) {
            inNode.removeInput(edge.inPortId, id);
            inNode.removeAuxIn(edge.inPortId, id);
        }
        this.edges.splice(edgeIndex, 1);
    }
    addEdge(edge) {
        this.edges.push(edge);
        return edge;
    }
    toggleSelect(type, id) {
        this.clearSelected();
        this.selected.push({ id: id, type: type });
    }
    select(type, id) {
        if (this.selected.some(s => s.id === id)) {
            return;
        }
        this.selected.push({ id: id, type: type });
    }
    unselect(id) {
        const index = this.selected.findIndex(o => o.id === id);
        if (index > -1) {
            this.selected.splice(index, 1);
        }
    }
    clearSelected() {
        this.selected = [];
    }
    deleteSelected() {
        for (let i = this.selected.length - 1; i >= 0; i--) {
            const sel = this.selected[i];
            if (sel.type === "edge") {
                this.removeEdge(sel.id);
            }
            else if (sel.type === "node") {
                this.removeNode(sel.id);
            }
        }
        this.clearSelected();
    }
    reset() {
        while (this.nodes.length > 0) {
            this.removeNode(this.nodes[0].id);
        }
        this.edges = [];
    }
    startEdge(id, edgeType, portId, nodeId, x, y) {
        this.clearSelected();
        const node = this.nodes.find(o => o.id === nodeId);
        if (!node) {
            console.error(`Source node "${nodeId}" not found for starting edge.`);
            return null;
        }
        const standardPort = node.outPorts.find(p => p.id === portId);
        const auxPort = node.auxOutPorts.find(p => p.id === portId);
        const canAddStandardOutput = standardPort && node.canAddOutput(portId);
        const canAddAuxOutput = auxPort && node.canAddAuxOut(portId);
        if (canAddStandardOutput || canAddAuxOutput) {
            const edgeRegistry = registry.category(NuidoEdgeRegistryName).get(edgeType);
            if (edgeRegistry && edgeRegistry.model) {
                this.newEdge = new edgeRegistry.model({
                    id: id,
                    edgeType: edgeType,
                    startX: x, startY: y, endX: x, endY: y,
                    outPortId: portId,
                    outNodeId: nodeId,
                    inPortId: null,
                    inNodeId: null,
                    paths: [],
                    joints: []
                });
                return this.newEdge;
            }
            else {
                console.error(`Edge type "${edgeType}" not found in registry.`);
                return null;
            }
        }
        else {
            console.warn(`Cannot start edge from port "${portId}" on node "${nodeId}". Port may be at max links or invalid.`);
            return null;
        }
    }
    updateNewEdge(x, y) {
        if (this.newEdge) {
            this.newEdge.updateEndPos(x, y);
        }
    }
    endEdge(portId, nodeId, x, y) {
        if (!this.newEdge) {
            console.warn("Cannot end edge: No new edge is currently being created.");
            return null;
        }
        const targetNode = this.nodes.find(o => o.id === nodeId);
        if (!targetNode) {
            console.error(`Target node "${nodeId}" not found for ending edge.`);
            return null;
        }
        this.newEdge.updateEndPos(x, y);
        this.newEdge.inNodeId = nodeId;
        this.newEdge.inPortId = portId;
        const targetPort = targetNode.inPorts.find(o => o.id === portId);
        const targetAuxPort = targetNode.auxInPorts.find(o => o.id === portId);
        let connectionSuccessful = false;
        if (targetPort && targetNode.canAddInput(portId, this.newEdge, this.nodes.find(n => n.id === this.newEdge.outNodeId))) {
            targetPort.addLink(this.newEdge);
            this.nodes.find(n => n.id === this.newEdge.outNodeId).addOutput(this.newEdge.outPortId, this.newEdge);
            this.edges.push(this.newEdge);
            connectionSuccessful = true;
        }
        else if (targetAuxPort && targetNode.canAddAuxIn(portId, this.newEdge, this.nodes.find(n => n.id === this.newEdge.outNodeId))) {
            targetAuxPort.addLink(this.newEdge);
            this.nodes.find(n => n.id === this.newEdge.outNodeId).addAuxOut(this.newEdge.outPortId, this.newEdge);
            this.edges.push(this.newEdge);
            connectionSuccessful = true;
        }
        else {
            console.warn(`Failed to connect edge "${this.newEdge.id}" to port "${portId}" on node "${nodeId}". Port capacity or compatibility issue.`);
        }
        const completedEdge = this.newEdge;
        this.clearNewEdge();
        return connectionSuccessful ? completedEdge : null;
    }
    clearNewEdge() {
        this.newEdge = undefined;
    }
    adjustEdgeEndpoint(portId, direction, nodeId, x, y) {
        const node = this.nodes.find(o => o.id === nodeId);
        if (!node)
            return;
        let port;
        switch (direction) {
            case "input":
                port = node.inPorts.find(o => o.id === portId);
                port?.links.forEach(edge => edge.updateEndPos(x, y));
                break;
            case "output":
                port = node.outPorts.find(o => o.id === portId);
                port?.links.forEach(edge => edge.updateStartPos(x, y));
                break;
            case "aux-in":
                port = node.auxInPorts.find(o => o.id === portId);
                port?.links.forEach(edge => edge.updateEndPos(x, y));
                break;
            case "aux-out":
                port = node.auxOutPorts.find(o => o.id === portId);
                port?.links.forEach(edge => edge.updateStartPos(x, y));
                break;
        }
    }
    export(full = true) {
        if (full) {
            const excludedKeys = ["links"];
            const res = JSON.stringify(this, (key, value) => {
                if (excludedKeys.includes(key)) {
                    return undefined;
                }
                return value;
            }, 4);
            return res;
        }
        else {
            const minifiedKeys = [
                "vprops", "lastVprops", "edgeType", "joints", "links", "paths",
                "left", "top", "nodeId", "maxLinks", "spec",
                "sessionId", "isProcessed", "selected", "newEdge", "edgeType", "auxEdgeType"
            ];
            return JSON.stringify(this, (key, value) => {
                if (minifiedKeys.includes(key)) {
                    return undefined;
                }
                return value;
            }, 4);
        }
    }
    import(json) {
        this.reset();
        const jsonObj = JSON.parse(json);
        const isSectionedNodeData = (value) => {
            if (value.sections)
                return true;
            else
                return false;
        };
        this.id = jsonObj.id;
        this.title = jsonObj.title;
        this.isProcessed = jsonObj.isProcessed;
        this.data = jsonObj.data || {};
        if (jsonObj["nodes"] && Array.isArray(jsonObj.nodes)) {
            jsonObj.nodes.forEach((jsonNode) => {
                const node = this.loadNode(jsonNode.id, jsonNode.icon, jsonNode.title, jsonNode.nodeType, jsonNode.left, jsonNode.top);
                if (node) {
                    const nodePropsToOmit = ["id", "icon", "title", "nodeType", "inPorts", "outPorts", "auxInPorts", "auxOutPorts", "sections", "vprops"];
                    Object.assign(node, omit(jsonNode, ...nodePropsToOmit));
                    const loadPorts = (portDataArray, addPortFn) => {
                        portDataArray.forEach((pData) => {
                            addPortFn.call(node, pData.id, pData.portType, pData.maxLinks, pData.spec);
                        });
                    };
                    loadPorts(jsonNode.inPorts || [], node.addInPort);
                    loadPorts(jsonNode.outPorts || [], node.addOutPort);
                    loadPorts(jsonNode.auxInPorts || [], node.addAuxInPort);
                    loadPorts(jsonNode.auxOutPorts || [], node.addAuxOutPort);
                    if (node instanceof SectionedNodeModel && isSectionedNodeData(jsonNode)) {
                        jsonNode.sections.forEach((sData) => {
                            const section = node.loadSection(sData.id, sData.sectionType, sData.direction, sData.inPortId, sData.outPortId);
                            if (section) {
                                const sectionPropsToOmit = ["id", "sectionType", "inPortId", "outPortId", "direction"];
                                Object.assign(section, omit(sData, ...sectionPropsToOmit));
                            }
                        });
                    }
                }
            });
        }
        if (jsonObj["edges"] && Array.isArray(jsonObj.edges)) {
            jsonObj.edges.forEach((eRawData) => {
                const loadedPaths = [];
                if (eRawData.paths && Array.isArray(eRawData.paths)) {
                    eRawData.paths.forEach((pRawData) => {
                        const path = this.loadPath(eRawData.edgeType, pRawData.id, pRawData.startX, pRawData.startY, pRawData.endX, pRawData.endY);
                        if (path) {
                            loadedPaths.push(path);
                        }
                        else {
                            console.warn(`Failed to load path with ID "${pRawData.id}" for edge "${eRawData.id}".`);
                        }
                    });
                }
                else {
                    console.warn(`Edge with ID "${eRawData.id}" has no path. Skipping.`);
                }
                const loadedJoints = [];
                if (eRawData.joints && Array.isArray(eRawData.joints)) {
                    eRawData.joints.forEach((jRawData) => {
                        const joint = new JointModel(jRawData);
                        loadedJoints.push(joint);
                    });
                }
                const edgeData = {
                    id: eRawData.id,
                    edgeType: eRawData.edgeType,
                    startX: eRawData.startX,
                    startY: eRawData.startY,
                    endX: eRawData.endX,
                    endY: eRawData.endY,
                    inPortId: eRawData.inPortId,
                    inNodeId: eRawData.inNodeId,
                    outPortId: eRawData.outPortId,
                    outNodeId: eRawData.outNodeId,
                    paths: loadedPaths,
                    joints: loadedJoints,
                };
                const edge = this.loadEdge(edgeData);
                const outNode = this.nodes.find(o => o.id === edge.outNodeId);
                let outPort = outNode.outPorts.find(o => o.id === edge.outPortId);
                if (outPort) {
                    outPort.addLink(edge);
                }
                else {
                    outPort = outNode.auxOutPorts.find(o => o.id === edge.outPortId);
                    outPort.addLink(edge);
                }
                const inNode = this.nodes.find(o => o.id === edge.inNodeId);
                let inPort = inNode.inPorts.find(o => o.id === edge.inPortId);
                if (inPort) {
                    inPort.addLink(edge);
                }
                else {
                    inPort = inNode.auxInPorts.find(o => o.id === edge.inPortId);
                    inPort.addLink(edge);
                }
                this.addEdge(edge);
            });
        }
    }
    loadPath(edgeType, id, startX, startY, endX, endY) {
        const edgeRegistry = registry.category(NuidoEdgeRegistryName).get(edgeType);
        if (edgeRegistry && edgeRegistry.model) {
            const pathClass = edgeRegistry.model.pathClass;
            const path = new pathClass({
                id: id,
                startX: startX,
                startY: startY,
                endX: endX,
                endY: endY
            });
            return path;
        }
        console.error(`Path creation failed for edge type "${edgeType}". Model or pathClass not found.`);
        return undefined;
    }
    loadEdge(edgeData) {
        const edgeRegistry = registry.category(NuidoEdgeRegistryName).get(edgeData.edgeType);
        if (edgeRegistry && edgeRegistry.model) {
            const edge = new edgeRegistry.model(edgeData);
            return edge;
        }
        console.error(`Edge type "${edgeData.edgeType}" not found in registry.`);
        return undefined;
    }
}
