/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { makeReactive } from "@nuido/utils/utils";
export class PathModel {
    id;
    vprops;
    constructor(data) {
        this.id = data.id;
        const vprops = {
            startX: data.startX,
            startY: data.startY,
            endX: data.endX,
            endY: data.endY
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
    setStartPos(x, y) {
        this.vprops.startX = x;
        this.vprops.startY = y;
    }
    moveStartPos(x, y) {
        this.vprops.startX += x;
        this.vprops.startY += y;
    }
    setEndPos(x, y) {
        this.vprops.endX = x;
        this.vprops.endY = y;
    }
    moveEndPos(x, y) {
        this.vprops.endX += x;
        this.vprops.endY += y;
    }
    getData() {
        return {
            id: this.id,
            startX: this.vprops.startX,
            startY: this.vprops.startY,
            endX: this.vprops.endX,
            endY: this.vprops.endY,
        };
    }
    toJSON() {
        return this.getData();
    }
}
