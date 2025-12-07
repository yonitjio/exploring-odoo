import { Component, useRef, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";

import { standardActionServiceProps } from "@web/webclient/actions/action_service";
import { uuidv4, createDiv } from "@node_ui_basics/utils/utils";

const icons = [
    "fa-envelope-open",
    "fa-clone",
    "fa-cog",
    "fa-database",
    "fa-folder-o",
    "fa-link",
    "fa-lock",
    "fa-pencil",
    "fa-plus",
    "fa-square-o",
]
function getRandomIcon() {
    return icons[Math.floor(Math.random() * 10)];
}

const SQUARE_HALF = 40;
const CIRCLE_RAD = 40

class NodeUiSvg extends Component {
    static template = "node-ui-svg";
    static components = {};
    static props = {
        ...standardActionServiceProps,
    };

    setup() {
        this.containerRef = useRef("container");

        this.dragging = undefined;

        this.state = useState({
            nodes: [],
            connections: [],
            selected: undefined,
            connecting: undefined
        });
    }

    onAddCircleButtonClick() {
        this.state.nodes.push({
            id: uuidv4(),
            cX: 50,
            cY: 50,
            r: CIRCLE_RAD,
            icon: getRandomIcon(),
            type: "circle"
        });
    }

    onAddSquareButtonClick() {
        this.state.nodes.push({
            id: uuidv4(),
            cX: 50,
            cY: 50,
            width: SQUARE_HALF * 2,
            height: SQUARE_HALF * 2,
            icon: getRandomIcon(),
            type: "square"
        });
    }

    onAdd7NodesButtonClick() {
        this.state.nodes.push({
                id: uuidv4(),
                cX: 1000,
                cY: 200,
                r: CIRCLE_RAD,
                icon: getRandomIcon(),
                type: "circle"
            },{
                id: uuidv4(),
                cX: 750,
                cY: 100,
                width: SQUARE_HALF * 2,
                height: SQUARE_HALF * 2,
                icon: getRandomIcon(),
                type: "square"
            },{
                id: uuidv4(),
                cX: 500,
                cY: 200,
                r: CIRCLE_RAD,
                icon: getRandomIcon(),
                type: "circle"
            },{
                id: uuidv4(),
                cX: 500,
                cY: 500,
                width: SQUARE_HALF * 2,
                height: SQUARE_HALF * 2,
                icon: getRandomIcon(),
                type: "square"
            },{
                id: uuidv4(),
                cX: 750,
                cY: 600,
                r: CIRCLE_RAD,
                icon: getRandomIcon(),
                type: "circle"
            },{
                id: uuidv4(),
                cX: 1000,
                cY: 500,
                width: SQUARE_HALF * 2,
                height: SQUARE_HALF * 2,
                icon: getRandomIcon(),
                type: "square"
            },{
                id: uuidv4(),
                cX: 750,
                cY: 325,
                r: CIRCLE_RAD,
                icon: getRandomIcon(),
                type: "circle"
            }
        );
    }

    onRemoveButtonClick(event) {
        if (this.state.selected){
            const nodeIdx = this.state.nodes.findIndex(o => o.id === this.state.selected);
            if (nodeIdx > -1){
                const node = this.state.nodes.at(nodeIdx);
                const cnns = this.state.connections.filter(c => c.sourceId === node.id || c.targetId === node.id)
                for (const cnn of cnns) {
                    const cnnIdx = this.state.connections.findIndex(c => c.id === cnn.id);
                    this.state.connections.splice(cnnIdx, 1);
                }
                this.state.nodes.splice(nodeIdx, 1);
            } else {
                const cnnIdx = this.state.connections.findIndex(c => c.id === this.state.selected);
                if (cnnIdx > -1) {
                this.state.connections.splice(cnnIdx, 1);
                }
            }
            this.state.selected = undefined;
        }
    }

    calcIntersectionPosForCircle(x1, y1, x2, y2, r){
        const xDist = x2 - x1;
        const yDist = y2 - y1;

        const diagDist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

        const ratio = r/diagDist
        const mposX = ratio * xDist;
        const mposY = ratio * yDist;

        return { x: x1 + mposX, y: y1 + mposY }
    }

    calcIntersectionPosForSquare(x1, y1, w, h, x2, y2){
        const xDist = Math.abs(x2 - x1);
        const yDist = Math.abs(y2 - y1);

        const signY = Math.sign(y2 - y1)
        const signX = Math.sign(x2 - x1)

        let res;
        if (yDist <= xDist) {
            const ratio = Math.abs((w/2)/xDist);

            const mposX = (w/2) * signX;
            const mposY = ratio * yDist * signY;

            res =  { x: x1 + mposX, y: y1 + mposY }
        } else {
            const ratio = Math.abs((h/2)/yDist);

            const mposX = ratio * xDist * signX;
            const mposY = (h/2) * signY;

            res =  { x: x1 + mposX, y: y1 + mposY }
        }

        return res;
    }

    calcMarkerPosByTargetPos(sourceEl, x, y) {
        const cRect = this.containerRef.el.getBoundingClientRect();
        const sourceRect = sourceEl.getBoundingClientRect();
        const funcForCircle = this.calcIntersectionPosForCircle;
        const funcForSquare = this.calcIntersectionPosForSquare;
        const pos = sourceEl.classList.contains("circle") ? funcForCircle(
            (sourceRect.left + sourceRect.width / 2) - cRect.left,
            (sourceRect.top + sourceRect.height / 2) - cRect.top,
            x,
            y,
            CIRCLE_RAD
        ) : funcForSquare(
            (sourceRect.left + sourceRect.width / 2) - cRect.left,
            (sourceRect.top + sourceRect.height / 2) - cRect.top,
            sourceRect.width,
            sourceRect.height,
            x,
            y
        );
        return pos;
    }

    calcMarkerPosByTargetEl(sourceEl, targetEl){
        const cRect = this.containerRef.el.getBoundingClientRect();
        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const funcForCircle = this.calcIntersectionPosForCircle;
        const funcForSquare = this.calcIntersectionPosForSquare;

        const pos = sourceEl.classList.contains("circle") ? funcForCircle(
            (sourceRect.left + sourceRect.width / 2) - cRect.left,
            (sourceRect.top + sourceRect.height / 2) - cRect.top,
            (targetRect.left + targetRect.width / 2) - cRect.left,
            (targetRect.top + targetRect.height / 2) - cRect.top,
            CIRCLE_RAD
        ) : funcForSquare(
            (sourceRect.left + sourceRect.width / 2) - cRect.left,
            (sourceRect.top + sourceRect.height / 2) - cRect.top,
            sourceRect.width,
            sourceRect.height,
            (targetRect.left + targetRect.width / 2) - cRect.left,
            (targetRect.top + targetRect.height / 2) - cRect.top,
        );

        return pos;
    }

    onNodeMouseDown(event){
        if (event.ctrlKey) {
            event.stopPropagation();
            event.preventDefault();
            const el = event.target;
            const cRect = this.containerRef.el.getBoundingClientRect();
            const pos = this.calcMarkerPosByTargetPos(el, event.x - cRect.left, event.y - cRect.top);

            this.state.connecting = {
                id: uuidv4(),
                startX: pos.x,
                startY: pos.y,
                endX: event.x - cRect.left,
                endY: event.y - cRect.top,
                sourceId: el.id,
            };
        } else {
            this.state.selected = event.target.id;
        }
    }

    onNodeMouseUp(event){
        if (this.state.connecting !== undefined){
            event.stopPropagation();
            if (event.target.classList.contains("node") && event.target.id !== this.state.connecting.sourceId) {
                const targetEl = event.target;
                const sourceEl = document.getElementById(this.state.connecting.sourceId);
                const targetPos = this.calcMarkerPosByTargetEl(targetEl, sourceEl);

                this.state.connecting.endX = targetPos.x;
                this.state.connecting.endY = targetPos.y;
                this.state.connecting.targetId = targetEl.id;

                const cnns = this.state.connections.filter(c =>
                    c.sourceId === this.state.connecting.id || c.targetId === this.state.connecting.id)
                if (cnns.length == 0){
                    this.state.connections.push(this.state.connecting);
                }
            }
        }
        this.state.connecting = undefined;
    }

    onMouseMove(event) {
        if (this.dragging) {
            const cRect = this.containerRef.el.getBoundingClientRect();
            if (event.x > cRect.left + 5 && event.y > cRect.top + 5
                && event.x < cRect.right - 20 && event.y < cRect.bottom - 20) {
                const node = this.state.nodes.find((o) => o.id == this.dragging);
                if (node){
                    node.cX += event.movementX;
                    node.cY += event.movementY;

                    const cnns = this.state.connections.filter(c => c.sourceId === node.id || c.targetId === node.id)
                    for (const cnn of cnns) {
                        this.updateConnectionPos(cnn);
                    }
                }
            }
        } else if (this.state.connecting){
            const cRect = this.containerRef.el.getBoundingClientRect();
            const sourceEl = document.getElementById(this.state.connecting.sourceId);
            const pos = this.calcMarkerPosByTargetPos(sourceEl, event.x - cRect.left, event.y - cRect.top);
            const cnn = this.state.connecting;

            cnn.startX = pos.x;
            cnn.startY = pos.y;
            cnn.endX = event.x - cRect.left;
            cnn.endY = event.y - cRect.top;
        }
    }

    onMouseDown(event){
        if (!event.ctrlKey) {
            if (event.target.classList.contains("node")) {
                this.dragging = event.target.id;
                this.selected = event.target.id;
            } else {
                this.dragging = undefined;
            }
        }
    }

    onMouseUp(event){
        this.dragging = undefined;
        this.state.connecting = undefined;
    }

    updateConnectionPos(cnn){
        const startNode = this.state.nodes.find(n => n.id === cnn.sourceId);
        const endNode = this.state.nodes.find(n => n.id === cnn.targetId);
        if (startNode !== undefined && endNode !== undefined) {
            const startEl = document.getElementById(startNode.id);
            const endEl = document.getElementById(endNode.id);

            let pos = this.calcMarkerPosByTargetEl(startEl, endEl);
            cnn.startX = pos.x;
            cnn.startY = pos.y;

            pos = this.calcMarkerPosByTargetEl(endEl, startEl);
            cnn.endX = pos.x;
            cnn.endY = pos.y;
        }
    }

    onLineSelected(event){
        this.state.selected = event.target.id;
    }

    onDeselectButtonClick(event) {
        this.state.selected = undefined;
    }
}

registry.category("actions").add("node_ui_svg", NodeUiSvg);
