import { Component, useRef, useState } from "@odoo/owl";
import { useService, useBus } from "@web/core/utils/hooks";

import { useDraggable } from "@node_ui/node_ui/utils";

export class Port extends Component {
    static template = "node_ui.port";
    static props = {
        port: Object
    };

    setup(){
        this.rootRef = useRef("root");

        useBus(this.env.bus, this.env.channel + "/debug", this.onDebug.bind(this));
    }

    onMouseDown(event) {
        if ((this.props.port.type === "out") && this.props.port.canAddLink()){
            const docElement = document.querySelector(".node-ui-doc");
            const docRect = docElement.getBoundingClientRect();
            const elRect = event.target.getBoundingClientRect();
            const x = ((elRect.left - docRect.left) + elRect.width / 2) / this.env.translation.zoom;
            const y = ((elRect.top - docRect.top) + elRect.height / 2) / this.env.translation.zoom;

            this.env.bus.trigger(this.env.channel + "/out-connect", {
                id: this.props.port.id,
                nodeId: this.props.port.nodeId,
                x: x,
                y: y
            });
        }
    }

    onMouseUp(event) {
        if ((this.props.port.type === "in") && this.props.port.canAddLink()){
            const docElement = document.querySelector(".node-ui-doc");
            const docRect = docElement.getBoundingClientRect();
            const elRect = event.target.getBoundingClientRect();
            const x = ((elRect.left - docRect.left) + elRect.width / 2) / this.env.translation.zoom;
            const y = ((elRect.top - docRect.top) + elRect.height / 2) / this.env.translation.zoom;

            this.env.bus.trigger(this.env.channel + "/in-connect", {
                id: this.props.port.id,
                nodeId: this.props.port.nodeId,
                x: x,
                y: y
            });
        }
    }

    onDebug(ev){
        console.log("debug")
    }
}

export class BaseNode extends Component {
    static template = "node_ui.node";
    static components = { Port };
    static props = {
        node: Object
    };

    setup() {
        this.ui = useService("ui");

        this.rootRef = useRef("root")
        this.position = useState({
            left: `${this.props.node.left}px`,
            top: `${this.props.node.top}px`,
        })

        useDraggable({
            ref: this.rootRef,
            handle: ".node-title",
            elements: ".node-container",
            // @ts-ignore
            onWillStartDrag: ({ element: ctx, getRect, x, y}) => {
                const elRect = getRect(ctx);
                const docRect = getRect(ctx.closest(".node-ui-doc"));

                const left = elRect.left - docRect.left;
                const top = elRect.top - docRect.top;

                ctx.startLeft = left / this.env.translation.zoom;
                ctx.startTop = top  / this.env.translation.zoom;

                ctx.startPointerX = x;
                ctx.startPointerY = y;

                ctx.lastPointerX = x;
                ctx.lastPointerY = y;
            },
            onDrag: ({ element: ctx, x, y}) => {
                const deltaX = (x - ctx.startPointerX) / this.env.translation.zoom;
                const deltaY = (y - ctx.startPointerY) / this.env.translation.zoom;

                const left = (ctx.startLeft + deltaX);
                const top = (ctx.startTop + deltaY);

                const trueDeltaX = (x - ctx.lastPointerX) / this.env.translation.zoom;
                const trueDeltaY = (y - ctx.lastPointerY) / this.env.translation.zoom;

                ctx.lastPointerX = x;
                ctx.lastPointerY = y;

                ctx.style.left = `${left}px`;
                ctx.style.top = `${top}px`;

                this.notifyUpdate(left, top, trueDeltaX, trueDeltaY);
            },
        });

        useBus(this.env.bus, this.env.channel + "/debug", this.onDebug.bind(this));
    }

    notifyUpdate(left, top, deltaX=0, deltaY=0){
        const node = this.props.node;
        node.move(left, top, deltaX, deltaY);
    }

    onClick(event){
        this.env.bus.trigger(this.env.channel + "/selected", {
            id: this.props.node.id,
            type: "node"
        });
    }

    get contentStyle() {
        if (this.ui.isSmall) {
            return "width: 128px;"
        } else {
            return "";
        }
    }

    onDebug(ev){
        console.log("debug");
    }
}

export class DumbNode extends BaseNode {
    static template = "node_ui.dumb-node";

    setup(){
        super.setup();

        const node = this.props.node;

        if (!node.loadedFromFile){
            const inId = "in-" + this.props.node.id +  "-1";
            node.addInPorts(inId, 1);

            const outId = "out-" + this.props.node.id +  "-1";
            node.addOutPorts(outId, 1);
        }
    }
}

export class DumbNodeNoInput extends BaseNode {
    static template = "node_ui.dumb-node-no-input";

    setup(){
        super.setup();

        const node = this.props.node;

        if (!node.loadedFromFile){
            const outId = "out-" + this.props.node.id +  "-1";
            node.addOutPorts(outId, 1);
        }
    }
}

export class DumbNodeMultipleOutputs extends BaseNode {
    static template = "node_ui.dumb-node-multiple-outputs";

    setup(){
        super.setup();

        const node = this.props.node;

        if (!node.loadedFromFile){
            const outId1 = "out-" + this.props.node.id +  "-1";
            node.addOutPorts(outId1, 1);

            const outId2 = "out-" + this.props.node.id +  "-2";
            node.addOutPorts(outId2, 2);
        }
    }
}

export class DumbNodeMultipleInputs extends BaseNode {
    static template = "node_ui.dumb-node-multiple-inputs";

    setup(){
        super.setup();

        const node = this.props.node;

        if (!node.loadedFromFile){
            const inId1 = "in-" + this.props.node.id +  "-1";
            node.addInPorts(inId1, 1);

            const inId2 = "in-" + this.props.node.id +  "-2";
            node.addInPorts(inId2, 2);
        }
    }
}

export class DumbNodeNoOutput extends BaseNode {
    static template = "node_ui.dumb-node-no-output";

    setup(){
        super.setup();

        const node = this.props.node;

        if (!node.loadedFromFile){
            const inId1 = "in-" + this.props.node.id +  "-1";
            node.addInPorts(inId1, 1);
        }
    }
}

export class DumbNodeWithTextArea extends BaseNode {
    static template = "node_ui.dumb-node-with-textarea";

    setup(){
        super.setup();

        const node = this.props.node;

        if (!node.loadedFromFile){
            const outId1 = "out-" + this.props.node.id +  "-1";
            node.addOutPorts(outId1, 1);
        }
    }
}
