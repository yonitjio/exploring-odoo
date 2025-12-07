// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { pick } from "@web/core/utils/objects";
import { uuidv4, makeReactive } from "@nuido/utils/utils";
import { PathModel } from "@nuido/models/path";
import { JointModel } from "@nuido/models/joint";
export class EdgeModel {
    id;
    edgeType;
    vprops;
    lastVprops;
    paths;
    joints;
    inPortId;
    inNodeId;
    outPortId;
    outNodeId;
    updatePaths = (owner, vprops) => {
        if (owner.paths.length > 0) {
            if (vprops.startX == owner.lastVprops.startX && vprops.startY == owner.lastVprops.startY) {
                Object.assign(owner.paths[owner.paths.length - 1].vprops, pick(vprops, "endX", "endY"));
            }
            else if (vprops.endX == owner.lastVprops.endX && vprops.endY == owner.lastVprops.endY) {
                Object.assign(owner.paths[0].vprops, pick(vprops, "startX", "startY"));
            }
        }
        Object.assign(owner.lastVprops, vprops);
    };
    constructor(id, edgeType, startX, startY, endX, endY, inPortId, inNodeId, outPortId, outNodeId, paths = [], joints = []) {
        this.id = id;
        this.edgeType = edgeType;
        this.paths = [].concat(paths);
        this.joints = [].concat(joints);
        this.lastVprops = {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY
        };
        const vprops = {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY
        };
        this.vprops = makeReactive(this, vprops, this.updatePaths);
        this.inPortId = inPortId;
        this.inNodeId = inNodeId;
        this.outPortId = outPortId;
        this.outNodeId = outNodeId;
        if (this.paths.length == 0) {
            const firstPathId = uuidv4();
            // @ts-ignore
            const pathClass = this.constructor.pathClass;
            const firstPath = new pathClass(firstPathId, this.vprops.startX, this.vprops.startY, this.vprops.endX, this.vprops.endY);
            this.paths.push(firstPath);
        }
    }
    static get pathClass() {
        return PathModel;
    }
    updateEndPos(x, y) {
        Object.assign(this.vprops, { endX: x, endY: y });
    }
    updateStartPos(x, y) {
        Object.assign(this.vprops, { startX: x, startY: y });
    }
    removeJoint(joint) {
        const jointIdx = this.joints.indexOf(joint);
        const startPathIdx = this.paths.findIndex(o => o.id == joint.startPathId);
        const startPath = this.paths[startPathIdx];
        if (this.joints.length > 1) {
            if (jointIdx == this.joints.length - 1) {
                startPath.vprops.endX = this.vprops.endX;
                startPath.vprops.endY = this.vprops.endY;
            }
            else {
                startPath.vprops.endX = this.joints[jointIdx + 1].vprops.cX;
                startPath.vprops.endY = this.joints[jointIdx + 1].vprops.cY;
                this.joints[jointIdx + 1].startPathId = startPath.id;
            }
        }
        else { // just one joint
            startPath.vprops.endX = this.vprops.endX;
            startPath.vprops.endY = this.vprops.endY;
        }
        const endPathIdx = this.paths.findIndex(o => o.id == joint.endPathId);
        this.paths.splice(endPathIdx, 1); // remove path
        this.joints.splice(jointIdx, 1); // remove joint
    }
    createJoint(path, x, y, previousJointIndex) {
        const pathIdx = this.paths.indexOf(path);
        const newJointId = uuidv4();
        const newJoint = new JointModel(newJointId, x, y, 6, path.id);
        this.joints.splice(previousJointIndex + 1, 0, newJoint);
        const oldEndX = path.vprops.endX;
        const oldEndY = path.vprops.endY;
        path.vprops.endX = x;
        path.vprops.endY = y;
        const newPathId = uuidv4();
        // @ts-ignore
        const pathClass = this.constructor.pathClass;
        const newPath = new pathClass(newPathId, x, y, oldEndX, oldEndY);
        this.paths.splice(pathIdx + 1, 0, newPath);
        newJoint.endPathId = newPathId;
        const newJointIdx = this.joints.findIndex(o => o.id == newJointId);
        if (this.joints[newJointIdx + 1]) {
            this.joints[newJointIdx + 1].startPathId = newPathId;
        }
    }
    moveJoint(id, x, y) {
        const joint = this.joints.find(o => o.id == id);
        if (joint) {
            joint.vprops.cX = joint.vprops.cX + x;
            joint.vprops.cY = joint.vprops.cY + y;
            const startPath = this.paths.find(o => o.id == joint.startPathId);
            startPath.vprops.endX = joint.vprops.cX;
            startPath.vprops.endY = joint.vprops.cY;
            const endPath = this.paths.find(o => o.id == joint.endPathId);
            endPath.vprops.startX = joint.vprops.cX;
            endPath.vprops.startY = joint.vprops.cY;
        }
    }
}
