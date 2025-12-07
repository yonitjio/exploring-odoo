/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
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
    constructor(data) {
        this.id = data.id;
        this.edgeType = data.edgeType;
        this.paths = data.paths || [];
        this.joints = data.joints || [];
        this.lastVprops = {
            startX: data.startX,
            startY: data.startY,
            endX: data.endX,
            endY: data.endY
        };
        const vprops = {
            startX: data.startX,
            startY: data.startY,
            endX: data.endX,
            endY: data.endY
        };
        this.vprops = makeReactive(this, vprops, this.updatePaths);
        this.inPortId = data.inPortId ?? null;
        this.inNodeId = data.inNodeId ?? null;
        this.outPortId = data.outPortId ?? null;
        this.outNodeId = data.outNodeId ?? null;
        if (this.paths.length === 0) {
            const firstPathId = uuidv4();
            const firstPath = new this.constructor.pathClass({
                id: firstPathId,
                startX: this.vprops.startX,
                startY: this.vprops.startY,
                endX: this.vprops.endX,
                endY: this.vprops.endY
            });
            this.paths.push(firstPath);
            this.joints = [];
        }
    }
    updatePaths(owner, updatedProps) {
        if (updatedProps.startX !== owner.lastVprops.startX || updatedProps.startY !== owner.lastVprops.startY) {
            if (owner.paths.length > 0) {
                Object.assign(owner.paths[0].vprops, pick(updatedProps, "startX", "startY"));
            }
        }
        if (updatedProps.endX !== owner.lastVprops.endX || updatedProps.endY !== owner.lastVprops.endY) {
            if (owner.paths.length > 0) {
                Object.assign(owner.paths[owner.paths.length - 1].vprops, pick(updatedProps, "endX", "endY"));
            }
        }
        Object.assign(owner.lastVprops, updatedProps);
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
        if (jointIdx === -1)
            return;
        const startPathIdx = this.paths.findIndex(o => o.id === joint.startPathId);
        const startPath = this.paths[startPathIdx];
        if (this.joints.length > 1) {
            if (jointIdx === this.joints.length - 1) {
                startPath.setEndPos(this.vprops.endX, this.vprops.endY);
            }
            else {
                const nextJoint = this.joints[jointIdx + 1];
                startPath.setEndPos(nextJoint.vprops.cX, nextJoint.vprops.cY);
                nextJoint.startPathId = startPath.id;
            }
        }
        else {
            startPath.setEndPos(this.vprops.endX, this.vprops.endY);
        }
        const endPathIdx = this.paths.findIndex(o => o.id === joint.endPathId);
        this.paths.splice(endPathIdx, 1);
        this.joints.splice(jointIdx, 1);
    }
    createJoint(path, x, y, previousJointIndex) {
        const pathIdx = this.paths.indexOf(path);
        if (pathIdx === -1) {
            throw new Error("Path to split not found in edge.");
        }
        const newJointId = uuidv4();
        const newJoint = new JointModel({
            id: newJointId,
            cX: x,
            cY: y,
            r: 6,
            startPathId: path.id
        });
        this.joints.splice(previousJointIndex + 1, 0, newJoint);
        const oldEndX = path.vprops.endX;
        const oldEndY = path.vprops.endY;
        path.setEndPos(x, y);
        const newPathId = uuidv4();
        const newPath = new this.constructor.pathClass({
            id: newPathId,
            startX: x,
            startY: y,
            endX: oldEndX,
            endY: oldEndY
        });
        this.paths.splice(pathIdx + 1, 0, newPath);
        newJoint.endPathId = newPathId;
        const newJointIndexInArray = previousJointIndex + 1;
        if (this.joints[newJointIndexInArray + 1]) {
            this.joints[newJointIndexInArray + 1].startPathId = newPathId;
        }
        return newJoint;
    }
    moveJoint(id, x, y) {
        const joint = this.joints.find(o => o.id === id);
        if (joint) {
            joint.move(x, y);
            const startPath = this.paths.find(o => o.id === joint.startPathId);
            if (startPath) {
                startPath.setEndPos(joint.vprops.cX, joint.vprops.cY);
            }
            const endPath = this.paths.find(o => o.id === joint.endPathId);
            if (endPath) {
                endPath.setStartPos(joint.vprops.cX, joint.vprops.cY);
            }
        }
    }
    getData() {
        return {
            id: this.id,
            edgeType: this.edgeType,
            startX: this.vprops.startX,
            startY: this.vprops.startY,
            endX: this.vprops.endX,
            endY: this.vprops.endY,
            inPortId: this.inPortId,
            inNodeId: this.inNodeId,
            outPortId: this.outPortId,
            outNodeId: this.outNodeId,
            paths: this.paths,
            joints: this.joints,
        };
    }
    toJSON() {
        return this.getData();
    }
}
