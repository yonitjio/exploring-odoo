// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { makeReactive } from "@nuido/utils/utils";
export class PathModel {
    id;
    vprops;
    constructor(id, startX, startY, endX, endY) {
        this.id = id;
        const vprops = {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY
        };
        this.vprops = makeReactive(this, vprops);
    }
    getSvgStraightPath() {
        const svgPath = [];
        svgPath.push("M", this.vprops.startX, this.vprops.startY);
        svgPath.push("L", this.vprops.endX, this.vprops.endY);
        const res = svgPath.join(" ");
        return res;
    }
    svgPath() {
        return this.getSvgStraightPath();
    }
}
