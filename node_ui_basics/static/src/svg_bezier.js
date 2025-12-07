import { Component, useRef, useState, onWillStart, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";

import { standardActionServiceProps } from "@web/webclient/actions/action_service";

class SvgBezier extends Component {
    static template = "svg-bezier";
    static components = {};
    static props = {
        ...standardActionServiceProps,
    };

    setup() {
        this.containerRef = useRef("container");

        const startX = 600;
        const startY = 400;
        const midX = 800;
        const midY = 100;
        const endX = 1000;
        const endY = 400;
        const rad = 15;

        this.state = useState({
            orientation: "auto",
            startNode: {
                cx: startX,
                cy: startY,
                r: rad,
            },
            midNode: {
                cx: midX,
                cy: midY,
                r: rad,
            },
            endNode: {
                cx: endX,
                cy: endY,
                r: rad,
            },
            path: "",
        });

        onMounted(() => {
            this.updatePath();
        });
    }

    onMouseDown(event) {
        if (event.target.id === "startNode" || event.target.id === "midNode" || event.target.id === "endNode") {
            this.dragging = event.target.id;
        } else {
            this.dragging = undefined;
        }
    }

    onMouseUp(event) {
        this.dragging = undefined;
    }

    onMouseMove(event) {
        if (this.dragging) {
            const cRect = this.containerRef.el.getBoundingClientRect();
            if (event.x > cRect.left + 5 && event.y > cRect.top + 5 && event.x < cRect.right - 20 && event.y < cRect.bottom - 20) {
                if (this.dragging === "startNode") {
                    this.state.startNode.cx += event.movementX;
                    this.state.startNode.cy += event.movementY;
                } else if (this.dragging === "midNode") {
                    this.state.midNode.cx += event.movementX;
                    this.state.midNode.cy += event.movementY;
                } else if (this.dragging === "endNode") {
                    this.state.endNode.cx += event.movementX;
                    this.state.endNode.cy += event.movementY;
                }
                this.updatePath();
            }
        }
    }

    updatePath(){
        this.state.path = this._createPaths();
    }

    _createPaths(){
        let res = "";

        const startNode = this.state.startNode;
        const midNode = this.state.midNode;
        const endNode = this.state.endNode;

        res = res + this._createPath(startNode.cx, startNode.cy, midNode.cx, midNode.cy);
        res = res + " " + this._createPath(midNode.cx, midNode.cy, endNode.cx, endNode.cy);

        return res;
    }

    // https://stackoverflow.com/a/45245042
    _createPath(startX, startY, endX, endY) {
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

        const svgPath = []
        svgPath.push("M", startX, startY);
        svgPath.push("L", BX, ",", BY);
        svgPath.push("C", CX, ",", CY);
        svgPath.push(DX, ",", DY);
        svgPath.push(EX, ",", EY);
        svgPath.push("L", endX, ",", endY);

        const res = svgPath.join(" ");

        return res;
    }
}

registry.category("actions").add("svg_bezier", SvgBezier);
