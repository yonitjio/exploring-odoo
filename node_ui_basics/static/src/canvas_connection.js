import { Component, useRef, useState, onWillStart, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";

import { standardActionServiceProps } from "@web/webclient/actions/action_service";

class CanvasConnection extends Component {
    static template = "canvas-connection";
    static components = {};
    static props = {
        ...standardActionServiceProps,
    };

    setup() {
        this.canvasRef = useRef("canvas");

        const startX = 600;
        const startY = 400;
        const midX = 800;
        const midY = 100;
        const endX = 1000;
        const endY = 400;
        const rad = 25;

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
        });

        onMounted(() => {
            this.canvasRef.el.width = this.canvasRef.el.parentElement.offsetWidth;
            this.canvasRef.el.height = this.canvasRef.el.parentElement.offsetHeight;
            this._drawCanvas();
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
            const cRect = this.canvasRef.el.getBoundingClientRect();
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
            }

            this._drawCanvas();
        }
    }

    _drawCanvas() {
        const ctx = this.canvasRef.el.getContext("2d");

        ctx.clearRect(0, 0, this.canvasRef.el.width, this.canvasRef.el.height);
        ctx.beginPath();

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#b58900";
        ctx.fillStyle = "#b58900";

        let path1 = new Path2D();
        let path2 = new Path2D();
        this._drawPath(path1, this.state.startNode, this.state.midNode, this.state.orientation);
        this._drawPath(path2, this.state.midNode, this.state.endNode, this.state.orientation);

        ctx.stroke(path1);
        ctx.stroke(path2);
    }

    _drawPath(path, firstNode, secondNode, orient = "auto") {
        let hDistance = Math.abs(firstNode.cx - secondNode.cx);
        let vDistance = Math.abs(firstNode.cy - secondNode.cy);

        let orientation = "v";
        if (orient == "auto"){
            orientation = hDistance > vDistance ? "v" : "h";
        } else {
            orientation = orient === "vertical" ? "v" : "h"
        }

        let firstX = firstNode.cx;
        let firstY = firstNode.cy;
        let secondX = secondNode.cx;
        let secondY = secondNode.cy;

        let midX = (secondX + firstX) / 2;
        let midY = (secondY + firstY) / 2;

        if (orientation === "v") {
            path.moveTo(firstX, firstY);
            path.lineTo(firstX, midY);
            path.lineTo(secondX, midY);
            path.lineTo(secondX, secondY);
        } else {
            path.moveTo(firstX, firstY);
            path.lineTo(midX, firstY);
            path.lineTo(midX, secondY);
            path.lineTo(secondX, secondY);
        }
    }
}

registry.category("actions").add("canvas_connection", CanvasConnection);
