import { Component, EventBus, useRef, useState, useSubEnv } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

import { standardActionServiceProps } from "@web/webclient/actions/action_service";

import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";

import { Document } from "@node_ui/node_ui/document"
import { Document as NuiDoc } from "@node_ui/node_ui/models";

import { uuidv4, data2blob, loadFile, useMovable, useMouseListener } from "@node_ui/node_ui/utils";

class NodeMenu extends Component {
    static template = "node_ui.node-menu";
    static props = {
        title: { type: String, optional: true },
        icon: { type: String, optional: true },
        action: Function,
    }

    setup() {
        this.rootRef = useRef("root");

        useMovable({
            ref: this.rootRef,
            elements: ".node-menu-container",
            // @ts-ignore
            onDrop: ({ x, y}) => {
                const doc = document.querySelector(".node-ui-doc");
                const docRect = doc.getBoundingClientRect();

                const docParent = doc.parentElement;
                const docRectParent = docParent.getBoundingClientRect();

                const docX = (x - docRect.left) / this.env.translation.zoom;
                const docY = (y - docRect.top) / this.env.translation.zoom;

                if (this._contains(docRectParent.left, docRectParent.top, docRectParent.width, docRectParent.height, x, y)) {
                    this.props.action(docX, docY);
                }
            }
        });
    }

    _contains(x1, y1, w, h, x, y){
        return x1 <= x && x <= (x1 + w) && y1 <= y && y <= (y1 + h);
    }
}

class NodeUi extends Component {
    static template = "node_ui.node-ui";
    static components = { Document, Dropdown, DropdownItem, NodeMenu };
    static props = {
        ...standardActionServiceProps
    };

    setup() {
        this.actions = [
            {
                title: "Node",
                icon: "/node_ui/static/images/align-center.svg",
                action: this.addDumbNode.bind(this)
            },
            {
                title: "Node - No Input",
                icon: "/node_ui/static/images/align-start.svg",
                action: this.addDumbNodeNoInput.bind(this)
            },
            {
                title: "Node - No Output",
                icon: "/node_ui/static/images/align-end.svg",
                action: this.addDumbNodeNoOutput.bind(this)
            },
            {
                title: "Node - Text Area",
                icon: "/node_ui/static/images/textbox.svg",
                action: this.addDumbNodeWithTextArea.bind(this)
            },
            {
                title: "Node - Multi Outputs",
                icon: "/node_ui/static/images/share.svg",
                action: this.addDumbNodeMultipleOutputs.bind(this)
            },
            {
                title: "Node - Multi Inputs",
                icon: "/node_ui/static/images/share-no-fill.svg",
                action: this.addDumbNodeMultipleInputs.bind(this)
            }
        ];

        const docId = uuidv4();
        const sessionId = uuidv4();

        const node_ui_env = {
            translation: {
                zoom_max: 2,
                zoom_min: 0.6,
                zoom_value: 0.1,
                last_zoom: 1,
                translateX: 0,
                translateY: 0,
                zoom: 1
            },
            channel: "node-ui",
            bus: new EventBus(),
            documents: [new NuiDoc(docId, sessionId, docId)]
        }

        useSubEnv(node_ui_env);

        this.state = useState({
            currentDoc: "",
            loading: false,
            env: node_ui_env
        })

        this.ui = useService("ui");

        this.nodeUiRef = useRef("node-ui");

        this.onHandleMouseDown = useMouseListener({
            onMouseMove: this.onMouseMove,
            onMouseUp: this.onMouseUp,
        });

        this.lastPointerPos = undefined;
        this.isMoving = false;

        this.dialog = useService("dialog");
    }

    get documents() {
        return this.state.env.documents;
    }

    get currentDocSessionId() {
        const currentDocId = this.state.env.documents[this.state.env.documents.length - 1].id;
        const currentSessionId = this.state.env.documents[this.state.env.documents.length - 1].sessionId;
        return currentDocId + "-" + currentSessionId;
    }

    saveDoc(){
        const jsonDoc = this.state.env.documents[0].toJson();
        // @ts-ignore
        saveAs(data2blob(jsonDoc), "doc.txt" );
    }

    openFile(file){
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const docId = uuidv4();
            const sessionId = uuidv4();
            const newDoc = new NuiDoc(docId, sessionId, docId);
            newDoc.fromJson(reader.result);
            this.state.env.documents.push(newDoc);
            setTimeout(() => {
                this.state.env.documents.shift();
            }, 20); // give time before destroying component
        });

        reader.readAsText(file);
    }

    async openDoc(){
        this.zoom_reset();
        this.state.loading = true;
        await new Promise(resolve => setTimeout(resolve, 250));
        const file = await loadFile();
        if (file != undefined && file != false) {
            this.openFile(file)
        };

        await new Promise(resolve => setTimeout(resolve, 500));
        this.state.loading = false;
    }

    addDumbNode(x, y) {
        this.state.env.bus.trigger(this.state.env.channel + "/new", { type: "dumb", x: x, y: y });
    }

    addDumbNodeNoInput(x, y) {
        this.state.env.bus.trigger(this.state.env.channel + "/new", { type: "dumb-no-input", x: x, y: y });
    }

    addDumbNodeNoOutput(x, y) {
        this.state.env.bus.trigger(this.state.env.channel + "/new", { type: "dumb-no-output", x: x, y: y });
    }

    addDumbNodeWithTextArea(x, y) {
        this.state.env.bus.trigger(this.state.env.channel + "/new", { type: "dumb-textarea", x: x, y: y });
    }

    addDumbNodeMultipleOutputs(x, y) {
        this.state.env.bus.trigger(this.state.env.channel + "/new", { type: "dumb-multiple-outputs", x: x, y: y });
    }

    addDumbNodeMultipleInputs(x, y) {
        this.state.env.bus.trigger(this.state.env.channel + "/new", { type: "dumb-multiple-inputs", x: x, y: y });
    }

    deleteSelected() {
        this.state.env.bus.trigger(this.state.env.channel + "/delete");
    }

    reset() {
        this.state.env.bus.trigger(this.state.env.channel + "/reset");
    }

    onDoubleClick(){
        this.state.env.bus.trigger(this.state.env.channel + "/clear-selected");
    }

    onMouseMove(event) {
        if (event.ctrlKey){
            event.stopPropagation();
            event.preventDefault();

            if (this.lastPointerPos){
                if (this.isMoving || Math.hypot(event.x - this.lastPointerPos.x, event.y - this.lastPointerPos.y) >= 20){
                    document.documentElement.style.cursor = "move";
                    this.state.env.translation.translateX = this.state.env.translation.translateX + event.movementX;
                    this.state.env.translation.translateY = this.state.env.translation.translateY + event.movementY;

                    const doc = document.querySelector(".node-ui-doc");
                    // @ts-ignore
                    doc.style.transform =
                        "translate(" +
                        this.state.env.translation.translateX +
                        "px, " +
                        this.state.env.translation.translateY +
                        "px) scale(" +
                        this.state.env.translation.zoom +
                        ")";

                    this._notifyZoomChanged();
                    this.isMoving = true;
                }
            }
            else {
                this.lastPointerPos = {
                    x: event.x,
                    y: event.y
                }
            }
        }
    }

    onMouseUp(event) {
        event.stopPropagation();
        event.preventDefault();

        document.documentElement.style.cursor = "default";
        this.lastPointerPos = undefined;
        this.isMoving = false;
    }

    _notifyZoomChanged(){
        this.state.env.bus.trigger(this.state.env.channel + "/zoom", {
            translateX: this.state.env.translation.translateX,
            translateY: this.state.env.translation.translateY,
            zoom: this.state.env.translation.zoom,
        });
    }

    onWheel(event){
        if (event.ctrlKey) {
            if (event.deltaY > 0) {
                this.zoom_out();
            } else {
                this.zoom_in();
            }
        }
    }

    zoom_refresh() {
        this.state.env.translation.translateX = (this.state.env.translation.translateX / this.state.env.translation.last_zoom)
            * this.state.env.translation.zoom;
        this.state.env.translation.translateY = (this.state.env.translation.translateY / this.state.env.translation.last_zoom)
            * this.state.env.translation.zoom;
        this.state.env.translation.last_zoom = this.state.env.translation.zoom;
        const doc = document.querySelector(".node-ui-doc");
        // @ts-ignore
        doc.style.transform =
            "translate(" +
            this.state.env.translation.translateX +
            "px, " +
            this.state.env.translation.translateY +
            "px) scale(" +
            this.state.env.translation.zoom +
            ")";

        this._notifyZoomChanged();
    }

    zoom_in() {
        if (this.state.env.translation.zoom < this.state.env.translation.zoom_max) {
            this.state.env.translation.zoom += this.state.env.translation.zoom_value;
            this.zoom_refresh();
        }
    }

    zoom_out() {
        if (this.state.env.translation.zoom > this.state.env.translation.zoom_min) {
            this.state.env.translation.zoom -= this.state.env.translation.zoom_value;
            this.zoom_refresh();
        }
    }

    zoom_reset() {
        if (this.state.env.translation.zoom != 1 || this.state.env.translation.translateX != 0 || this.state.env.translation.translateY != 0) {
            this.state.env.translation.translateX = 0;
            this.state.env.translation.translateY = 0;
            this.state.env.translation.zoom = 1;
            this.zoom_refresh();
        }
    }

    get zoom(){
        // @ts-ignore
        return Math.round(this.state.env.translation.zoom + "e+2");
    }

    get nodeMenuStyle() {
        if (this.ui.isSmall){
            return "width: 60px;";
        } else {
            return "width: 225px;";
        }
    }

    debug() {
        this.state.env.bus.trigger(this.state.env.channel + "/debug");
    }
}

registry.category("actions").add("NodeUi", NodeUi);
