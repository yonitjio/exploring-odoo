import { Component, useRef, useState, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";
import { uuidv4 } from "@node_ui_basics/utils/utils";

class CanvasNodes extends Component {
    static template = "canvas-nodes";
    static components = {};
    static props = {
        ...standardActionServiceProps,
    };

    setup() {
        this.canvasRef = useRef("canvas");

        this.state = useState({
            nodes: [],
            selected: undefined,
        });

        onMounted(() => {
            this.canvasRef.el.width = this.canvasRef.el.parentElement.offsetWidth;
            this.canvasRef.el.height = this.canvasRef.el.parentElement.offsetHeight;
            this._drawCanvas();
        });
    }

    onAddButtonClick() {
        this.state.nodes.push({
            id: uuidv4(),
            cx: 50,
            cy: 50,
            r: 25,
        });

        this._drawCanvas();
    }

    onAdd7NodesButtonClick() {
        this.state.nodes.push({
                id: uuidv4(),
                cx: 1000,
                cy: 200,
                r: 25,
            },{
                id: uuidv4(),
                cx: 750,
                cy: 100,
                r: 25,
            },{
                id: uuidv4(),
                cx: 500,
                cy: 200,
                r: 25,
            },{
                id: uuidv4(),
                cx: 500,
                cy: 500,
                r: 25,
            },{
                id: uuidv4(),
                cx: 750,
                cy: 600,
                r: 25,
            },{
                id: uuidv4(),
                cx: 1000,
                cy: 500,
                r: 25,
            },{
                id: uuidv4(),
                cx: 750,
                cy: 325,
                r: 25,
            }
        );

        this._drawCanvas();
    }

    onRemoveButtonClick(event) {
        if (this.state.selected){
            let nodeIdx = this.state.nodes.findIndex(o => o.id === this.state.selected);
            if (nodeIdx > -1){
                this.state.nodes.splice(nodeIdx, 1);
                this._drawCanvas();
            }
            this.state.selected = undefined;
        }
    }

    onNodeSelected(event){
        this.state.selected = event.target.id;
    }


    onMouseDown(event) {
        if (event.target.classList.contains("node")) {
            this.dragging = event.target.id;
            this.selected = event.target.id;
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
                const node = this.state.nodes.find((o) => o.id == this.dragging);
                if (node){
                    node.cx += event.movementX;
                    node.cy += event.movementY;
                }
            }

            this._drawCanvas();
        }
    }

    _drawCanvas() {
        if (this.state.nodes.length > 0) {
            const nodes = this.state.nodes;
            const ctx = this.canvasRef.el.getContext("2d");

            ctx.clearRect(0, 0, this.canvasRef.el.width, this.canvasRef.el.height);
            ctx.beginPath();

            ctx.lineWidth = 3;
            ctx.strokeStyle = "#b58900";
            ctx.fillStyle = "#b58900";

            let path = new Path2D();

            path.moveTo(nodes[0].cx, nodes[0].cy);
            for (let i = 1; i < this.state.nodes.length; i++) {
                path.lineTo(nodes[i].cx, nodes[i].cy);
            }
            ctx.stroke(path);
        }
    }
}

registry.category("actions").add("canvas_nodes", CanvasNodes);
