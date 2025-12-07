/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { removeItem } from "@nuido/utils/utils";
export var PortDirection;
(function (PortDirection) {
    PortDirection["in"] = "input";
    PortDirection["out"] = "output";
    PortDirection["auxIn"] = "aux-in";
    PortDirection["auxOut"] = "aux-out";
})(PortDirection || (PortDirection = {}));
export class PortModel {
    id;
    nodeId;
    portType;
    direction;
    maxLinks;
    links;
    spec;
    constructor(data) {
        this.id = data.id;
        this.nodeId = data.nodeId;
        this.portType = data.portType;
        this.direction = data.direction;
        this.maxLinks = data.maxLinks;
        this.spec = data.spec;
        this.links = [];
    }
    move(deltaX, deltaY) {
        this.links.forEach(edge => {
            if (["input", "aux-in"].includes(this.direction)) {
                edge.vprops.endX += deltaX;
                edge.vprops.endY += deltaY;
            }
            else if (["output", "aux-out"].includes(this.direction)) {
                edge.vprops.startX += deltaX;
                edge.vprops.startY += deltaY;
            }
        });
    }
    canAddLink() {
        return this.links.length < this.maxLinks;
    }
    addLink(edge) {
        if (!this.canAddLink()) {
            return;
        }
        if (edge.id in this.links) {
            return;
        }
        this.links.push(edge);
    }
    removeLink(id) {
        removeItem(this.links, id);
    }
    clearLinks() {
        this.links = [];
    }
    getData() {
        return {
            id: this.id,
            nodeId: this.nodeId,
            portType: this.portType,
            direction: this.direction,
            maxLinks: this.maxLinks,
            spec: this.spec,
        };
    }
    toJSON() {
        return this.getData();
    }
}
