// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useRef } from "@odoo/owl";
import { useBus } from "@web/core/utils/hooks";
import { useDraggable } from "@nuido/utils/utils";
import { EdgeModel } from "@nuido/models/edge";
import { DebugEventType } from "@nuido/components/events";
import { Path } from "@nuido/components/path";
import { Joint } from "@nuido/components/joint";
export class Edge extends Component {
    static template = "nuido.edge";
    static components = { Path, Joint };
    static props = {
        edge: EdgeModel,
        cssClass: { type: String, optional: true },
    };
    static defaultProps = {
        cssClass: ""
    };
    rootRef;
    setup() {
        this.rootRef = useRef("root");
        useDraggable({
            ref: this.rootRef,
            elements: ".joint",
            onWillStartDrag: ({ element: ctx, x, y }) => {
                const edge = this.props.edge;
                const joint = edge.joints.find((o) => o.id == ctx.id);
                ctx.startX = joint.vprops.cX;
                ctx.startY = joint.vprops.cY;
                ctx.lastX = x;
                ctx.lastY = y;
            },
            onDrag: ({ element: ctx, x, y }) => {
                const deltaX = (x - ctx.lastX) / this.env.ui.zoom;
                const deltaY = (y - ctx.lastY) / this.env.ui.zoom;
                ctx.lastX = x;
                ctx.lastY = y;
                this.onMoveJoint(ctx.id, deltaX, deltaY);
            },
        });
        useBus(this.env.nbus, this.env.channel + DebugEventType, this.onDebug.bind(this));
    }
    onMoveJoint(id, x, y) {
        const edge = this.props.edge;
        edge.moveJoint(id, x, y);
    }
    _pointIsOnPath(pathEl, x, y) {
        const svg = this.rootRef.el;
        let point = svg.createSVGPoint();
        point.x = x;
        point.y = y;
        return pathEl.isPointInStroke(point);
    }
    _findPrecedingJoint(x, y) {
        const edge = this.props.edge;
        let onPath = false;
        for (let i = 0; i < edge.paths.length; i++) {
            const pathEl = document.getElementById(edge.paths[i].id);
            const onPath = this._pointIsOnPath(pathEl, x, y);
            if (onPath) {
                const jointIdx = edge.joints.findIndex(o => o.endPathId == edge.paths[i].id);
                return { idx: jointIdx, onPath: onPath };
            }
        }
        return { idx: -1, onPath: onPath };
    }
    onClick(event) {
        if (event.ctrlKey) {
            const edge = this.props.edge;
            const target = event.target;
            if (target.nodeName === "circle") {
                const joint = edge.joints.find((o) => o.id == target.id);
                if (joint) {
                    edge.removeJoint(joint);
                }
            }
            else if (target.nodeName === "path") {
                const path = edge.paths.find((o) => o.id == target.id);
                if (path) {
                    const docElement = document.querySelector(".nuido-doc");
                    const docRect = docElement.getBoundingClientRect();
                    const evX = event.clientX;
                    const evY = event.clientY;
                    const x = (evX - docRect.left) / this.env.ui.zoom;
                    const y = (evY - docRect.top) / this.env.ui.zoom;
                    const precedingJoint = this._findPrecedingJoint(x, y);
                    if (precedingJoint.onPath) {
                        edge.createJoint(path, x, y, precedingJoint.idx);
                    }
                }
            }
        }
        else {
            this.env.nbus.trigger(this.env.channel + "/toggle" /* SelectionEventType.toggle */, {
                id: this.props.edge.id,
                type: "edge" /* SelectionType.edge */
            });
        }
    }
    async onDoubleClick(event) {
    }
    onDebug(event) {
        console.log("debug");
    }
}
