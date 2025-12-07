// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { Default } from "@nuido/utils/registry";
import { uuidv4 } from "@nuido/utils/utils";
export class MapItem {
    constructor(id, name = "", value = "", parent_id = "") {
        this.id = id;
        this.name = name;
        this.value = value;
        this.parent_id = parent_id;
    }
}
export class MapperNodeModel extends NodeModel {
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        this.map = [new MapItem(uuidv4(), "maproot")];
    }
}
