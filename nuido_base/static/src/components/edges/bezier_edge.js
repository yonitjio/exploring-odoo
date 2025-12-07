// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { NuidoEdgeRegistryName } from "@nuido/utils/registry";
import { Edge } from "@nuido/components/edge";
import { EdgeModel } from "@nuido/models/edge";
import { PathModel } from "@nuido/models/path";
export class BezierEdge extends Edge {
}
export class BezierPath extends PathModel {
    // https://stackoverflow.com/a/45245042
    createPath(startX, startY, endX, endY) {
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
        const svgPath = [];
        svgPath.push("M", startX, startY);
        svgPath.push("L", BX, ",", BY);
        svgPath.push("C", CX, ",", CY);
        svgPath.push(DX, ",", DY);
        svgPath.push(EX, ",", EY);
        svgPath.push("L", endX, ",", endY);
        const res = svgPath.join(" ");
        return res;
    }
    svgPath() {
        const res = this.createPath(this.vprops.startX, this.vprops.startY, this.vprops.endX, this.vprops.endY);
        return res;
    }
}
export class BezierEdgeModel extends EdgeModel {
    static get pathClass() {
        return BezierPath;
    }
}
registry.category(NuidoEdgeRegistryName).add(BezierEdge.name, {
    component: BezierEdge,
    model: BezierEdgeModel
});
