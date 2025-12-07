// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
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
    constructor(id, nodeId, portType, direction, maxLinks, spec = {}) {
        this.id = id;
        this.nodeId = nodeId;
        this.portType = portType;
        this.direction = direction;
        this.maxLinks = maxLinks;
        this.spec = spec;
        this.links = [];
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
}
