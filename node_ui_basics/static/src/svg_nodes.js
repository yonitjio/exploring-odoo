import { Component, useRef, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";

import { standardActionServiceProps } from "@web/webclient/actions/action_service";
import { uuidv4 } from "@node_ui_basics/utils/utils";

class SvgNodes extends Component {
    static template = "svg-nodes";
    static components = {};
    static props = {
        ...standardActionServiceProps,
    };

    setup() {
        this.containerRef = useRef("container");

        this.state = useState({
            nodes: [],
            selected: undefined,
        });
    }

    onAddButtonClick() {
        this.state.nodes.push({
            id: uuidv4(),
            cx: 50,
            cy: 50,
            r: 25,
        });
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
    }

    onRemoveButtonClick(event) {
        if (this.state.selected){
            let nodeIdx = this.state.nodes.findIndex(o => o.id === this.state.selected);
            if (nodeIdx > -1){
                this.state.nodes.splice(nodeIdx, 1);
            }
            this.state.selected = undefined;
        }
    }

    onNodeSelected(event){
        this.state.selected = event.target.id;
    }

    onMouseDown(event){
        if (event.target.classList.contains("node")) {
            this.dragging = event.target.id;
            this.selected = event.target.id;
        } else {
            this.dragging = undefined;
        }
    }

    onMouseUp(event){
        this.dragging = undefined;
    }

    onMouseMove(event) {
        if (this.dragging) {
            const cRect = this.containerRef.el.getBoundingClientRect();
            if (event.x > cRect.left + 5 && event.y > cRect.top + 5 && event.x < cRect.right - 20 && event.y < cRect.bottom - 20) {
                const node = this.state.nodes.find((o) => o.id == this.dragging);
                if (node){
                    node.cx += event.movementX;
                    node.cy += event.movementY;
                }
            }
        }
    }
}

registry.category("actions").add("svg_nodes", SvgNodes);
