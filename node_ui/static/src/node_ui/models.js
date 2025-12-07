import { pick } from "@web/core/utils/objects";

import { uuidv4, makeReactive, removeItem } from "@node_ui/node_ui/utils";
import { BaseNode } from "@node_ui/node_ui/node";

import { DumbNode, DumbNodeNoInput, DumbNodeNoOutput, DumbNodeWithTextArea,
    DumbNodeMultipleInputs, DumbNodeMultipleOutputs } from "@node_ui/node_ui/node";

const CLASS_MAP = {
    DumbNode: DumbNode,
    DumbNodeNoInput: DumbNodeNoInput,
    DumbNodeNoOutput: DumbNodeNoOutput,
    DumbNodeWithTextArea: DumbNodeWithTextArea,
    DumbNodeMultipleInputs: DumbNodeMultipleInputs,
    DumbNodeMultipleOutputs: DumbNodeMultipleOutputs,
}

class NodeUiBase {
    constructor(id = uuidv4()){
        this.id = id;
        this.loadedFromFile = false;
    }
}

class TitledUiBase extends NodeUiBase {
    constructor(id, title){
        super(id);
        this.title = title;
    }
}

export class Waypoint extends NodeUiBase {
    constructor(id, centerX, centerY, radius, startPathId, endPathId){
        super(id);

        const initPos = {
            centerX: centerX,
            centerY: centerY,
            radius: radius,
        }

        this.pos = makeReactive(this, initPos);

        this.startPathId = startPathId;
        this.endPathId = endPathId;
    }
}

export class Path extends NodeUiBase {
    constructor(id, startX, startY, endX, endY){
        super(id);
        const initPos = {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY
        }

        this.pos = makeReactive(this, initPos);
    }

    getSvgStraightPath() {
        const svgPath = [];

        svgPath.push("M", this.pos.startX, this.pos.startY);
        svgPath.push("L", this.pos.endX, this.pos.endY);
        const res = svgPath.join(" ");
        return res;
    }

    // https://stackoverflow.com/a/45245042
    _drawCurve(startX, startY, endX, endY) {
        // L
        let BX = Math.abs(endX - startX) * 0.05 + startX;
        let BY = startY;

        // C
        let CX = startX + Math.abs(endX - startX) * 0.33;
        let CY = startY;
        let DX = endX - Math.abs(endX - startX) * 0.33;
        let DY = endY;
        let EX = -Math.abs(endX - startX) * 0.05 + endX;
        let EY = endY;

        const svgPath = []
        svgPath.push("M", startX, startY);
        svgPath.push("L", BX, ",", BY);
        svgPath.push("C", CX, ",", CY);
        svgPath.push(DX, ",", DY);
        svgPath.push(EX, ",", EY);
        svgPath.push("L", endX, ",", endY);

        const res = svgPath.join(" ");

        return res;
    }

    svgCurvyPath() {
        const res = this._drawCurve(
            this.pos.startX,
            this.pos.startY,
            this.pos.endX,
            this.pos.endY
        );
        return res;
    }

    svgPath() {
        return this.svgCurvyPath();
    }
}

export class Connection extends NodeUiBase {
    constructor(id, startX, startY, endX, endY, inPortId, inNodeId, outPortId, outNodeId, {
            paths = [],
            waypoints = []
        } = {}){
        super(id);

        this.paths = [].concat(paths);
        this.waypoints = [].concat(waypoints);
        this.lastPos = {};

        const initPos = {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY
        }

        this.pos = makeReactive(this, initPos, { onChangedHandler: this.updatePaths });

        this.inPortId = inPortId;
        this.inNodeId = inNodeId;
        this.outPortId = outPortId;
        this.outNodeId = outNodeId;

        if (this.paths.length == 0){
            const firstPathId = uuidv4();
            const firstPath = new Path(firstPathId, this.pos.startX, this.pos.startY, this.pos.endX, this.pos.endY);
            this.paths.push(firstPath);
        }
    }

    updatePaths(owner, pos) {
        if (owner.paths.length > 0){
            if (pos.startX == owner.lastPos.startX && pos.startY == owner.lastPos.startY){
                Object.assign(owner.paths[owner.paths.length - 1].pos, pick(pos, "endX", "endY"));
            } else if (pos.endX == owner.lastPos.endX && pos.endY == owner.lastPos.endY){
                Object.assign(owner.paths[0].pos, pick(pos, "startX", "startY"));
            }
        }
        Object.assign(owner.lastPos, pos);
    }

    updateEndPos(x, y) {
        Object.assign(this.pos, {endX: x, endY: y});
    }

    updateStartPos(x, y) {
        Object.assign(this.pos, {startX: x, startY: y});
    }

    removeWaypoint(waypoint){
        const waypointIdx = this.waypoints.indexOf(waypoint);

        const startPathIdx = this.paths.findIndex(o => o.id == waypoint.startPathId);
        const startPath = this.paths[startPathIdx];

        if (this.waypoints.length > 1) {
            if (waypointIdx == this.waypoints.length - 1){
                startPath.pos.endX = this.pos.endX;
                startPath.pos.endY = this.pos.endY;
            } else {
                startPath.pos.endX = this.waypoints[waypointIdx + 1].pos.centerX;
                startPath.pos.endY = this.waypoints[waypointIdx + 1].pos.centerY;

                this.waypoints[waypointIdx + 1].startPathId = startPath.id;
            }
        } else { // just one waypoint
            startPath.pos.endX = this.pos.endX;
            startPath.pos.endY = this.pos.endY;
        }

        const endPathIdx = this.paths.findIndex(o => o.id == waypoint.endPathId);
        this.paths.splice(endPathIdx, 1); // remove path
        this.waypoints.splice(waypointIdx, 1); // remove waypoint
    }

    createWaypoint(path, x, y, previousWaypointIndex){
        const pathIdx = this.paths.indexOf(path);

        const newWaypointId = uuidv4();
        const newWaypoint = new Waypoint(newWaypointId, x, y, 6, path.id);

        this.waypoints.splice(previousWaypointIndex + 1, 0, newWaypoint);

        const oldEndX = path.pos.endX;
        const oldEndY = path.pos.endY;

        path.pos.endX = x;
        path.pos.endY = y;

        const newPathId = uuidv4();
        const newPath = new Path(newPathId, x, y, oldEndX, oldEndY)
        this.paths.splice(pathIdx + 1, 0, newPath);

        newWaypoint.endPathId = newPathId;
        const newWaypointIdx = this.waypoints.findIndex(o => o.id == newWaypointId);
        if (this.waypoints[newWaypointIdx + 1]){
            this.waypoints[newWaypointIdx + 1].startPathId = newPathId;
        }
    }

    moveWaypoint(id, x, y) {
        const wp = this.waypoints.find(o => o.id == id);
        if (wp){
            wp.pos.centerX = x;
            wp.pos.centerY = y;

            const startPath = this.paths.find(o => o.id == wp.startPathId);
            startPath.pos.endX = x;
            startPath.pos.endY = y;

            const endPath = this.paths.find(o => o.id == wp.endPathId);
            endPath.pos.startX = x;
            endPath.pos.startY = y;
        }
    }
}

export class Port extends NodeUiBase {
    constructor(id, nodeId, type, maxLinks){
        super(id);
        this.nodeId = nodeId;
        this.type = type;
        this.maxLinks = maxLinks;

        this.links = [];
    }

    canAddLink() {
        return this.links.length < this.maxLinks
    }

    addLink(cnn) {
        if (!this.canAddLink()){
            return;
        }
        if (cnn.id in this.links){
            return;
        }

        this.links.push(cnn);
    }

    removeLink(id){
        removeItem(this.links, id);
    }

    clearLinks(){
        this.links = [];
    }
}

export class Node extends TitledUiBase {
    constructor(id, title, component, left, top){
        super(id, title);
        this.component = component;
        this.left = left;
        this.top = top;

        this.inPorts = [];
        this.outPorts = [];
    }

    move(left, top, deltaX, deltaY){
        this.left = left;
        this.top = top;

        this.inPorts.forEach(port => {
            port.links.forEach(cnn => {
                cnn.pos.endX = cnn.pos.endX + deltaX;
                cnn.pos.endY = cnn.pos.endY + deltaY;
            });
        });

        this.outPorts.forEach(port => {
            port.links.forEach(cnn => {
                cnn.pos.startX = cnn.pos.startX + deltaX;
                cnn.pos.startY = cnn.pos.startY + deltaY;
            });
        })
    }

    addInPorts(id, maxLinks){
        const port = new Port(id, this.id, "in", maxLinks);
        this.inPorts.push(port)
        return port;
    }

    addOutPorts(id, maxLinks){
        const port = new Port(id, this.id, "out", maxLinks);
        this.outPorts.push(port)
        return port;
    }

    canAddInput(portId){
        const port = this.inPorts.find(o => o.id == portId);
        return port.canAddLink()
    }

    addInput(portId, cnn){
        const port = this.inPorts.find(o => o.id == portId);
        port.addLink(cnn)
    }

    removeInput(portId, cnnId){
        const port = this.inPorts.find(o => o.id == portId);
        port.removeLink(cnnId);
    }

    canAddOutput(portId){
        const port = this.outPorts.find(o => o.id == portId);
        return port.canAddLink()
    }

    addOutput(portId, cnn){
        const port = this.outPorts.find(o => o.id == portId);
        port.addLink(cnn)
    }

    removeOutput(portId, cnnId){
        const port = this.outPorts.find(o => o.id == portId);
        port.removeLink(cnnId);
    }

    getConnections(){
        let res = [];

        this.inPorts.forEach(port => {
            res = res.concat(port.links)
        });

        this.outPorts.forEach(port => {
            res = res.concat(port.links)
        });

        return res;
    }

    resetConnections(){
        this.inPorts.forEach(port => {
            port.clearLinks();
        });

        this.outPorts.forEach(port => {
            port.clearLinks();
        });
    }
}

export class Document extends TitledUiBase {
    constructor(id, sessionId, title){
        super(id, title);

        this.sessionId = sessionId;

        this.nodes = [];
        this.connections = [];
        this.newConnection = undefined;
        this.selected = [];
    }

    addNode(id, title, component, left, top) {
        const node = new Node(id, title, component, left, top);
        this.nodes.push(node);
        return node;
    }

    removeConnection(id){
        const cnnIdx = this.connections.findIndex(o => o.id === id);
        if (cnnIdx > -1){
            const cnn = this.connections[cnnIdx];
            const outNode = this.nodes.find(o => o.id === cnn.outNodeId);
            const inNode = this.nodes.find(o => o.id === cnn.inNodeId);
            outNode.removeOutput(cnn.outPortId, id);
            inNode.removeInput(cnn.inPortId, id);

            removeItem(this.connections, id);
        }
    }

    addConnection(cnn){
        this.connections.push(cnn);
        return cnn;
    }

    toggleSelect(type, id){
        const i = this.selected.findIndex(o => o.id == id);
        if (i > -1){
            this.selected.splice(i, 1);
        }else {
            this.selected.push({
                id: id,
                type: type
            })
        }
    }

    clearSelected(){
        this.selected = [];
    }

    removeNode(id){
        const node = this.nodes.find(o => o.id === id);
        const cnns = node.getConnections();

        node.resetConnections();

        cnns.forEach(cnn => {
            this.removeConnection(cnn.id);
        });

        removeItem(this.nodes, id);
    }

    deleteSelected(){
        for(let i = 0; i < this.selected.length; i++){
            const sel = this.selected[i];
            if (sel.type === "connection"){
                this.removeConnection(sel.id);
            } else if (sel.type === 'node'){
                this.removeNode(sel.id);
            }
        }
        this.clearSelected();
    }

    reset() {
        while (this.nodes.length > 0){
            const node = this.nodes[0];
            this.removeNode(node.id);
        }
    }

    prepareConnection(id, portId, nodeId, x, y){
        this.clearSelected();

        const node = this.nodes.find(o => o.id === nodeId);
        if (node.canAddOutput(portId)){
            this.newConnection = new Connection(
                id,
                x,
                y,
                x,
                y,
                null,
                null,
                portId,
                nodeId
            );
            return this.newConnection;
        }
        return null;
    }

    updateNewConnection(x,y){
        this.newConnection.updateEndPos(x, y);
    }

    completeConnection(portId, nodeId, x, y){
        if(this.newConnection !== undefined){
            const node = this.nodes.find(o => o.id === nodeId);
            if (node.canAddInput(portId)){
                const cnn = this.newConnection;

                cnn.pos.endX = x;
                cnn.pos.endY = y;
                cnn.inPortId = portId;
                cnn.inNodeId = nodeId;

                const outNode = this.nodes.find(o => o.id === cnn.outNodeId);
                outNode.addOutput(cnn.outPortId, cnn);

                const inNode = this.nodes.find(o => o.id === cnn.inNodeId);
                inNode.addInput(cnn.inPortId, cnn);

                this.connections.push(cnn);

                this.clearNewConnection();
            }
        }
    }

    clearNewConnection(){
        this.newConnection = undefined;
    }

    toJson(){
        return JSON.stringify(this, (key, value) =>{
            if (key === "component") {
                if (value.prototype instanceof BaseNode) return value.name
                else return value;
            } else if (key === "links") {
                return undefined;
            } else{
                return value;
            }
        });
    }

    fromJson(json){
        this.reset();

        const jsonObj = JSON.parse(json, (key, value) => {
            if (key === "component") {
                return CLASS_MAP[value];
            } else {
                return value;
            }
        });

        this.id = jsonObj.id;
        this.title = jsonObj.title;
        this.loadedFromFile = true;

        jsonObj["nodes"].forEach(o => {
            const node = this.addNode(o.id, o.title, o.component, o.left, o.top);
            node.loadedFromFile = true;
            o.inPorts.forEach( p => {
                const port = node.addInPorts(p.id, p.maxLinks);
                port.loadedFromFile = true;
            });
            o.outPorts.forEach( p => {
                const port = node.addOutPorts(p.id, p.maxLinks);
                port.loadedFromFile = true;
            });
        });

        jsonObj["connections"].forEach( c =>{
            const paths = [];
            c.paths.forEach(p => {
                const path = new Path(p.id, p.pos.startX, p.pos.startY, p.pos.endX, p.pos.endY);
                path.loadedFromFile = true;
                paths.push(path);
            })

            const waypoints = []
            c.waypoints.forEach(wp => {
                const waypoint = new Waypoint(wp.id, wp.pos.centerX, wp.pos.centerY, wp.pos.radius,
                    wp.startPathId, wp.endPathId);
                waypoint.loadedFromFile = true;
                waypoints.push(waypoint);
            });

            const cnn = new Connection(
                c.id, c.pos.startX, c.pos.startY, c.pos.endX, c.pos.endY,
                c.inPortId, c.inNodeId, c.outPortId, c.outNodeId, {
                    paths: paths,
                    waypoints: waypoints
                }
            );
            cnn.loadedFromFile = true;

            const outNode = this.nodes.find(o => o.id === cnn.outNodeId);
            outNode.addOutput(cnn.outPortId, cnn);

            const inNode = this.nodes.find(o => o.id === cnn.inNodeId);
            inNode.addInput(cnn.inPortId, cnn);

            this.addConnection(cnn);
        });
    }
}
