// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { NuidoPortRegistryName } from "@nuido/utils/registry";
export class NodeModel {
    id;
    title;
    icon;
    nodeType;
    vprops;
    cssClass;
    inPorts;
    outPorts;
    auxInPorts;
    auxOutPorts;
    constructor(id, icon, title, nodeType, left, top, options = {}) {
        this.id = id;
        this.icon = icon;
        this.title = title;
        this.nodeType = nodeType;
        const { width, height, cssClass } = options;
        this.vprops = {
            left: left,
            top: top,
            width: width,
            height: height
        };
        this.cssClass = cssClass ?? "";
        this.inPorts = [];
        this.outPorts = [];
        this.auxInPorts = [];
        this.auxOutPorts = [];
    }
    setup() {
    }
    move(deltaX, deltaY) {
        this.vprops.left = this.vprops.left + deltaX;
        this.vprops.top = this.vprops.top + deltaY;
        this.inPorts.forEach(port => {
            port.links.forEach(edge => {
                edge.vprops.endX = edge.vprops.endX + deltaX;
                edge.vprops.endY = edge.vprops.endY + deltaY;
            });
        });
        this.auxInPorts.forEach(port => {
            port.links.forEach(edge => {
                edge.vprops.endX = edge.vprops.endX + deltaX;
                edge.vprops.endY = edge.vprops.endY + deltaY;
            });
        });
        this.outPorts.forEach(port => {
            port.links.forEach(edge => {
                edge.vprops.startX = edge.vprops.startX + deltaX;
                edge.vprops.startY = edge.vprops.startY + deltaY;
            });
        });
        this.auxOutPorts.forEach(port => {
            port.links.forEach(edge => {
                edge.vprops.startX = edge.vprops.startX + deltaX;
                edge.vprops.startY = edge.vprops.startY + deltaY;
            });
        });
    }
    _createPort(id, portType, direction, maxLinks, spec = {}) {
        const portRegistry = registry.category(NuidoPortRegistryName).get(portType);
        if (portRegistry && portRegistry.model) {
            const port = new portRegistry.model(id, this.id, portType, direction, maxLinks, spec);
            return port;
        }
        return undefined;
    }
    addInPort(id, portType, maxLinks, spec = {}) {
        const port = this._createPort(id, portType, "input" /* PortDirection.in */, maxLinks, spec);
        if (port) {
            this.inPorts.push(port);
        }
        return port;
    }
    addOutPort(id, portType, maxLinks, spec = {}) {
        const port = this._createPort(id, portType, "output" /* PortDirection.out */, maxLinks, spec);
        if (port) {
            this.outPorts.push(port);
        }
        return port;
    }
    addAuxInPort(id, portType, maxLinks, spec = {}) {
        const port = this._createPort(id, portType, "aux-in" /* PortDirection.auxIn */, maxLinks, spec);
        if (port) {
            this.auxInPorts.push(port);
        }
        return port;
    }
    addAuxOutPort(id, portType, maxLinks, spec = {}) {
        const port = this._createPort(id, portType, "aux-out" /* PortDirection.auxOut */, maxLinks, spec);
        if (port) {
            this.auxOutPorts.push(port);
        }
        return port;
    }
    canAddInput(portId, edge, sourceNode) {
        const sourcePort = sourceNode.outPorts.find(o => o.id === edge.outPortId);
        if (sourcePort?.direction === "output" /* PortDirection.out */) {
            const port = this.inPorts.find(o => o.id == portId);
            if (port) {
                return port.canAddLink();
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    addInput(portId, edge) {
        const port = this.inPorts.find(o => o.id == portId);
        port.addLink(edge);
    }
    removeInput(portId, edgeId) {
        const port = this.inPorts.find(o => o.id == portId);
        const auxPort = this.auxInPorts.find(o => o.id == portId);
        port?.removeLink(edgeId);
        auxPort?.removeLink(edgeId);
    }
    canAddOutput(portId) {
        const port = this.outPorts.find(o => o.id == portId);
        if (port) {
            return port.canAddLink();
        }
        else {
            return false;
        }
    }
    addOutput(portId, edge) {
        const port = this.outPorts.find(o => o.id == portId);
        port.addLink(edge);
    }
    removeOutput(portId, edgeId) {
        const port = this.outPorts.find(o => o.id == portId);
        const auxPort = this.auxOutPorts.find(o => o.id == portId);
        port?.removeLink(edgeId);
        auxPort?.removeLink(edgeId);
    }
    canAddAuxIn(portId, edge, sourceNode) {
        const sourcePort = sourceNode.auxOutPorts.find(o => o.id === edge.outPortId);
        if (sourcePort?.direction === "aux-out" /* PortDirection.auxOut */) {
            const port = this.auxInPorts.find(o => o.id == portId);
            if (port) {
                return port.canAddLink();
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    addAuxIn(portId, edge) {
        const port = this.auxInPorts.find(o => o.id == portId);
        port.addLink(edge);
    }
    removeAuxIn(portId, edgeId) {
        const port = this.auxInPorts.find(o => o.id == portId);
        port.removeLink(edgeId);
    }
    canAddAuxOut(portId) {
        const port = this.auxOutPorts.find(o => o.id == portId);
        if (port) {
            return port.canAddLink();
        }
        else {
            return false;
        }
    }
    addAuxOut(portId, edge) {
        const port = this.auxOutPorts.find(o => o.id == portId);
        port.addLink(edge);
    }
    removeAuxOut(portId, edgeId) {
        const port = this.auxOutPorts.find(o => o.id == portId);
        port.removeLink(edgeId);
    }
    getLinkedEdges() {
        let res = [];
        this.inPorts.forEach(port => {
            res = res.concat(port.links);
        });
        this.outPorts.forEach(port => {
            res = res.concat(port.links);
        });
        this.auxInPorts.forEach(port => {
            res = res.concat(port.links);
        });
        this.auxOutPorts.forEach(port => {
            res = res.concat(port.links);
        });
        return res;
    }
    getPorts() {
        let res = [];
        res = res.concat(this.inPorts, this.outPorts, this.auxInPorts, this.auxOutPorts);
        return res;
    }
    resetPorts() {
        this.inPorts.forEach(port => {
            port.clearLinks();
        });
        this.outPorts.forEach(port => {
            port.clearLinks();
        });
        this.auxInPorts.forEach(port => {
            port.clearLinks();
        });
        this.auxOutPorts.forEach(port => {
            port.clearLinks();
        });
    }
    getAuxInputEdges() {
        let res = [];
        this.auxInPorts.forEach(port => {
            res = res.concat(port.links);
        });
        return res;
    }
    getAuxOutputEdges() {
        let res = [];
        this.auxOutPorts.forEach(port => {
            res = res.concat(port.links);
        });
        return res;
    }
}
