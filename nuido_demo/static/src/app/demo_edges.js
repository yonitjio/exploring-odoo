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
export class DemoOrthogonalEdge extends Edge {
}
export class OrthogonalPath extends PathModel {
    createPath(startX, startY, endX, endY, orient) {
        let res = "";
        let hDistance = Math.abs(startX - endX);
        let vDistance = Math.abs(startY - endY);
        let orientation = "v";
        if (orient == "auto") {
            orientation = hDistance > vDistance ? "h" : "v";
        }
        else {
            orientation = orient === "vertical" ? "v" : "h";
        }
        let midX = (endX + startX) / 2;
        let midY = (endY + startY) / 2;
        const dirX = Math.sign(endX - startX);
        const dirY = Math.sign(endY - startY);
        let dirA = dirX > 0 ? 0 : 1;
        let dirAFlip = dirA == 0 ? 1 : 0;
        if (dirY < 0) {
            const temp = dirA;
            dirA = dirAFlip;
            dirAFlip = temp;
        }
        const minDistance = 5;
        const baseMargin = 10;
        let margin = baseMargin;
        if (hDistance <= margin * 2 || vDistance <= margin * 2) {
            margin = hDistance > vDistance ? vDistance : hDistance;
        }
        const marginX = margin * dirX;
        const marginY = margin * dirY;
        if (orientation === "v") {
            res += "M" + (startX) + "," + (startY);
            res += " L" + (startX) + "," + (midY - marginY);
            if (hDistance > baseMargin * 2) {
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirA) + " " + (startX + marginX) + "," + (midY);
                res += " L" + (endX - marginX) + "," + (midY);
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirAFlip) + " " + (endX) + "," + (midY + marginY);
            }
            else if (hDistance > minDistance) {
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirA) + " " + (startX + marginX / 2) + "," + (midY);
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirAFlip) + " " + (endX) + "," + (midY + marginY);
            }
            else {
                res += " L" + (endX) + "," + (midY + marginY);
            }
            res += " L" + (endX) + "," + (endY);
        }
        else {
            res += "M" + (startX) + "," + (startY);
            res += " L" + (midX - marginX) + "," + (startY);
            if (vDistance > baseMargin * 2) {
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirAFlip) + " " + (midX) + "," + (startY + marginY);
                res += " L" + (midX) + "," + (endY - marginY);
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirA) + " " + (midX + marginX) + "," + (endY);
            }
            else if (vDistance > minDistance) {
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirAFlip) + " " + (midX) + "," + (startY + marginY / 2);
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirA) + " " + (midX + marginX) + "," + (endY);
            }
            else {
                res += " L" + (midX + marginX) + "," + (endY);
            }
            res += " L" + (endX) + "," + (endY);
        }
        return res;
    }
    svgPath() {
        const res = this.createPath(this.vprops.startX, this.vprops.startY, this.vprops.endX, this.vprops.endY, "horizontal");
        return res;
    }
}
export class DemoOrthogonalEdgeModel extends EdgeModel {
    static get pathClass() {
        return OrthogonalPath;
    }
}
export class DemoCurvedEdge extends Edge {
}
export class CurvedPath extends PathModel {
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
export class DemoCurvedEdgeModel extends EdgeModel {
    static get pathClass() {
        return CurvedPath;
    }
}
registry.category(NuidoEdgeRegistryName).add(DemoOrthogonalEdge.name, {
    component: DemoOrthogonalEdge,
    model: DemoOrthogonalEdgeModel
});
registry.category(NuidoEdgeRegistryName).add(DemoCurvedEdge.name, {
    component: DemoCurvedEdge,
    model: DemoCurvedEdgeModel
});
