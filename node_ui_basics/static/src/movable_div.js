import { Component, useRef, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";

class MovableDiv extends Component {
    static template = "movable-div";
    static components = {};
    static props = {
        ...standardActionServiceProps,
    };

    setup() {
        this.containerRef = useRef("container");

        this.state = useState({
            cdLeft: 800,
            cdTop: 100,
            cLeft: 700,
            cTop: 100
        });

        this.dragging = undefined;
    }

    onMouseDown(event){
        if (event.target.classList.contains("diamond")){
            this.dragging = "cd";
        } else if (event.target.classList.contains("circle")){
            this.dragging = "c";
        }
    }

    onMouseUp(event){
        this.dragging = undefined;
    }

    onMouseMove(event){
        if (this.dragging === "cd"){
            this.state.cdLeft += event.movementX;
            this.state.cdTop += event.movementY;
        } else if (this.dragging === "c"){
            this.state.cLeft += event.movementX;
            this.state.cTop += event.movementY;
        }
    }
}

registry.category("actions").add("movable_div", MovableDiv);

