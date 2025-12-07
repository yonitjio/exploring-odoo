import { Component, useRef, useState, onWillStart, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";

import { standardActionServiceProps } from "@web/webclient/actions/action_service";

class SvgConnection extends Component {
    static template = "svg-connection";
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
        this.state.path = this._createPaths(this.state.orientation);
    }

    _createPaths(orient = "auto"){
        let res = "";

        res = res + this._createPath(this.state.startNode, this.state.midNode, orient);
        res = res + " " + this._createPath(this.state.midNode, this.state.endNode, orient);

        return res;
    }

    _createPath(firstNode, secondNode, orient) {
        let res = "";

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

        const dirX = Math.sign(secondX - firstX);
        const dirY = Math.sign(secondY - firstY);

        let dirA = dirX > 0 ? 0 : 1;
        let dirAFlip = dirA == 0 ? 1 : 0;

        if (dirY < 0){
            const temp = dirA;
            dirA = dirAFlip;
            dirAFlip = temp;
        }

        const minDistance = 5;
        const baseMargin = 10;
        let margin = baseMargin;
        if (hDistance <= margin * 2 || vDistance <= margin * 2){
            margin = hDistance > vDistance ? vDistance : hDistance;
        }

        const marginX = margin * dirX;
        const marginY = margin * dirY;

        if (orientation === "v") {
            res += "M" + (firstX) + "," + (firstY);
            res += " L" + (firstX) + "," + (midY - marginY);

            if (hDistance > baseMargin * 2){
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirA) + " " +  (firstX + marginX) + "," + (midY);
                res += " L" + (secondX - marginX) + "," + (midY);
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirAFlip) + " " +  (secondX) + "," + (midY + marginY);
            } else if (hDistance > minDistance){
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirA) + " " +  (firstX + marginX / 2) + "," + (midY);
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirAFlip) + " " +  (secondX) + "," + (midY + marginY);
            } else {
                res += " L" + (secondX) + "," + (midY + marginY);
            }

            res += " L" + (secondX) + "," + (secondY);
        } else {
            res += "M" + (firstX) + "," + (firstY);
            res += " L" + (midX - marginX) + "," + (firstY);
            if (vDistance > baseMargin * 2){
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirAFlip) + " " +  (midX) + "," + (firstY + marginY);
                res += " L" + (midX) + "," + (secondY - marginY);
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirA) + " " +  (midX + marginX) + "," + (secondY);
            } else if (vDistance > minDistance){
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirAFlip) + " " +  (midX) + "," + (firstY + marginY / 2);
                res += " A" + (margin) + " " + (margin) + " 90 0 " + " "
                    + (dirA) + " " +  (midX + marginX) + "," + (secondY);
            } else {
                res += " L" + (midX + marginX) + "," + (secondY);
            }
            res += " L" + (secondX) + "," + (secondY);
        }
        return res;
    }
}

registry.category("actions").add("svg_connection", SvgConnection);
