import { Component, useRef, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";

class SvgBasics extends Component {
    static template = "svg-basics";
    static components = { };
    static props = {
        ...standardActionServiceProps
    };

    setup() {
        this.svgRef = useRef("svg");
        this.state = useState({
            startX: 100,
            startY: 50,
            endX: 1550,
            endY: 300,
            controlX: 200,
            controlY: 200,
        })

        this.dragging = undefined;
    }

    onMouseDown(event){
        this.dragging = event.target;
    }

    onMouseUp(event){
        this.dragging = undefined;
    }

    onMouseMove(event){
        if (this.dragging){
            const svgRect = this.svgRef.el.getBoundingClientRect();
            const el = this.dragging;
            if (event.x > svgRect.left + 5 && event.y > svgRect.top + 5
                && event.x < svgRect.right - 5 && event.y < svgRect.bottom - 5){
                    if(el.id === "startPoint"){
                    this.state.startX += event.movementX;
                    this.state.startY += event.movementY;
                } else if (el.id === "endPoint"){
                    this.state.endX += event.movementX;
                    this.state.endY += event.movementY;
                } else if (el.id === "controlPoint"){
                    this.state.controlX += event.movementX;
                    this.state.controlY += event.movementY;
                }
            }
        }
    }
}

registry.category("actions").add("svg_basics", SvgBasics);
