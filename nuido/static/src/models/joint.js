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
export class JointModel {
    id;
    vprops;
    startPathId;
    endPathId;
    constructor(data) {
        this.id = data.id;
        const vprops = {
            cX: data.cX,
            cY: data.cY,
            r: data.r,
        };
        this.vprops = makeReactive(this, vprops);
        this.startPathId = data.startPathId;
        this.endPathId = data.endPathId;
    }
    move(x, y) {
        this.vprops.cX += x;
        this.vprops.cY += y;
    }
    setPosition(x, y) {
        this.vprops.cX = x;
        this.vprops.cY = y;
    }
    getData() {
        return {
            id: this.id,
            cX: this.vprops.cX,
            cY: this.vprops.cY,
            r: this.vprops.r,
            startPathId: this.startPathId,
            endPathId: this.endPathId,
        };
    }
    toJSON() {
        return this.getData();
    }
}
