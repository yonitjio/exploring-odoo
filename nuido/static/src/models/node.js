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
import { NuidoPortRegistryName } from "@nuido/utils/registry";
export class NodeModel {
    id;
    title;
    icon;
    nodeType;
    vprops;
    inPorts;
    outPorts;
    auxInPorts;
    auxOutPorts;
    constructor(data) {
        this.id = data.id;
        this.icon = data.icon;
        this.title = data.title;
        this.nodeType = data.nodeType;
        this.vprops = {
            left: data.left,
            top: data.top,
            width: data.width,
            height: data.height
        };
        this.inPorts = [];
        this.outPorts = [];
        this.auxInPorts = [];
        this.auxOutPorts = [];
    }
    setup() {
    }
    move(deltaX, deltaY) {
        this.vprops.left += deltaX;
        this.vprops.top += deltaY;
        const movePorts = (ports) => ports.forEach(port => port.move(deltaX, deltaY));
        movePorts(this.inPorts);
        movePorts(this.auxInPorts);
        movePorts(this.outPorts);
        movePorts(this.auxOutPorts);
    }
    _createPort(id, portType, direction, maxLinks, spec = {}) {
        const portRegistry = registry.category(NuidoPortRegistryName).get(portType);
        if (portRegistry && portRegistry.model) {
            const port = new portRegistry.model({
                id: id,
                nodeId: this.id,
                portType: portType,
                direction: direction,
                maxLinks: maxLinks,
                spec: spec
            });
            return port;
        }
        console.error(`Port type "${portType}" not found in registry.`);
        return undefined;
    }
    addInPort(id, portType, maxLinks, spec = {}) {
        const port = this._createPort(id, portType, "input", maxLinks, spec);
        if (port) {
            this.inPorts.push(port);
        }
        return port;
    }
    addOutPort(id, portType, maxLinks, spec = {}) {
        const port = this._createPort(id, portType, "output", maxLinks, spec);
        if (port) {
            this.outPorts.push(port);
        }
        return port;
    }
    addAuxInPort(id, portType, maxLinks, spec = {}) {
        const port = this._createPort(id, portType, "aux-in", maxLinks, spec);
        if (port) {
            this.auxInPorts.push(port);
        }
        return port;
    }
    addAuxOutPort(id, portType, maxLinks, spec = {}) {
        const port = this._createPort(id, portType, "aux-out", maxLinks, spec);
        if (port) {
            this.auxOutPorts.push(port);
        }
        return port;
    }
    canAddInput(portId, edge, sourceNode) {
        const sourcePort = sourceNode.outPorts.find(o => o.id === edge.outPortId);
        if (sourcePort && sourcePort.direction === "output") {
            const port = this.inPorts.find(o => o.id === portId);
            if (port) {
                return port.canAddLink();
            }
        }
        return false;
    }
    addInput(portId, edge) {
        const port = this.inPorts.find(o => o.id === portId);
        if (port) {
            port.addLink(edge);
        }
        else {
            console.warn(`Input port "${portId}" not found on node "${this.id}".`);
        }
    }
    removeInput(portId, edgeId) {
        const port = this.inPorts.find(o => o.id === portId);
        const auxPort = this.auxInPorts.find(o => o.id === portId);
        port?.removeLink(edgeId);
        auxPort?.removeLink(edgeId);
    }
    canAddOutput(portId) {
        const port = this.outPorts.find(o => o.id === portId);
        if (port) {
            return port.canAddLink();
        }
        return false;
    }
    addOutput(portId, edge) {
        const port = this.outPorts.find(o => o.id === portId);
        if (port) {
            port.addLink(edge);
        }
        else {
            console.warn(`Output port "${portId}" not found on node "${this.id}".`);
        }
    }
    removeOutput(portId, edgeId) {
        const port = this.outPorts.find(o => o.id === portId);
        const auxPort = this.auxOutPorts.find(o => o.id === portId);
        port?.removeLink(edgeId);
        auxPort?.removeLink(edgeId);
    }
    canAddAuxIn(portId, edge, sourceNode) {
        const sourcePort = sourceNode.auxOutPorts.find(o => o.id === edge.outPortId);
        if (sourcePort && sourcePort.direction === "aux-out") {
            const port = this.auxInPorts.find(o => o.id === portId);
            if (port) {
                return port.canAddLink();
            }
        }
        return false;
    }
    addAuxIn(portId, edge) {
        const port = this.auxInPorts.find(o => o.id === portId);
        if (port) {
            port.addLink(edge);
        }
        else {
            console.warn(`Auxiliary input port "${portId}" not found on node "${this.id}".`);
        }
    }
    removeAuxIn(portId, edgeId) {
        const port = this.auxInPorts.find(o => o.id === portId);
        port?.removeLink(edgeId);
    }
    canAddAuxOut(portId) {
        const port = this.auxOutPorts.find(o => o.id === portId);
        if (port) {
            return port.canAddLink();
        }
        return false;
    }
    addAuxOut(portId, edge) {
        const port = this.auxOutPorts.find(o => o.id === portId);
        if (port) {
            port.addLink(edge);
        }
        else {
            console.warn(`Auxiliary output port "${portId}" not found on node "${this.id}".`);
        }
    }
    removeAuxOut(portId, edgeId) {
        const port = this.auxOutPorts.find(o => o.id === portId);
        port?.removeLink(edgeId);
    }
    getLinkedEdges() {
        const allPorts = [...this.inPorts, ...this.outPorts, ...this.auxInPorts, ...this.auxOutPorts];
        return allPorts.flatMap(port => port.links);
    }
    getPorts() {
        return [...this.inPorts, ...this.outPorts, ...this.auxInPorts, ...this.auxOutPorts];
    }
    resetPorts() {
        this.getPorts().forEach(port => {
            port.clearLinks();
        });
    }
    getAuxInputEdges() {
        return this.auxInPorts.flatMap(port => port.links);
    }
    getAuxOutputEdges() {
        return this.auxOutPorts.flatMap(port => port.links);
    }
    getData() {
        return {
            id: this.id,
            title: this.title,
            icon: this.icon,
            nodeType: this.nodeType,
            left: this.vprops.left,
            top: this.vprops.top,
            height: this.vprops.height,
            width: this.vprops.width,
            inPorts: this.inPorts,
            outPorts: this.outPorts,
            auxInPorts: this.auxInPorts,
            auxOutPorts: this.auxOutPorts,
        };
    }
    toJSON() {
        return this.getData();
    }
}
