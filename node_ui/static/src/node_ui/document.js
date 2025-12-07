import { Component, useRef, onMounted, onWillUnmount } from "@odoo/owl";
import { useBus } from "@web/core/utils/hooks";
import { useDebounced, useThrottleForAnimation } from "@web/core/utils/timing";

import { uuidv4 } from "@node_ui/node_ui/utils";

import { DumbNode, DumbNodeNoInput, DumbNodeNoOutput, DumbNodeWithTextArea,
    DumbNodeMultipleInputs, DumbNodeMultipleOutputs } from "@node_ui/node_ui/node";

import { Connection } from "@node_ui/node_ui/connection";

export class Document extends Component {
    static template = "node_ui.document";
    static props = {
        document: Object,
    };

    setup() {
        this.rootRef = useRef("root");

        onMounted(() => {
            document.addEventListener("mousemove", this.onMouseMove.bind(this));
            document.addEventListener("mouseup", this.onMouseUp.bind(this));
        });

        onWillUnmount(() => {
            document.removeEventListener("mousemove", this.onMouseMove.bind(this));
            document.removeEventListener("mouseup", this.onMouseUp.bind(this));
        });

        this.onMouseUp = useDebounced(this.onMouseUp, "animationFrame");
        this.onMouseMove = useThrottleForAnimation(this.onMouseMove);

        useBus(this.env.bus, this.env.channel + "/new", this.onNewNode.bind(this));
        useBus(this.env.bus, this.env.channel + "/delete", this.onDeleteSelected.bind(this));
        useBus(this.env.bus, this.env.channel + "/reset", this.onReset.bind(this));
        useBus(this.env.bus, this.env.channel + "/selected", this.onSelected.bind(this));
        useBus(this.env.bus, this.env.channel + "/clear-selected", this.onClearSelected.bind(this));

        useBus(this.env.bus, this.env.channel + "/out-connect", this.onOutConnect.bind(this));
        useBus(this.env.bus, this.env.channel + "/in-connect", this.onInConnect.bind(this));

        useBus(this.env.bus, this.env.channel + "/debug", this.onDebug.bind(this));
    }

    get connectionComponent() {
        return Connection;
    }

    _createNode(title, component, x, y) {
        const id = uuidv4();

        const doc = this.props.document;
        doc.addNode(id, title, component, x, y);
    }

    onNewNode(event) {
        const type = event.detail.type;
        const x = event.detail.x;
        const y = event.detail.y;
        switch (type) {
            case "dumb": {
                this._createNode("Node", DumbNode, x, y);
                break;
            }
            case "dumb-no-input": {
                this._createNode("Node - No Input", DumbNodeNoInput, x, y);
                break;
            }
            case "dumb-no-output": {
                this._createNode("Node - No Output", DumbNodeNoOutput, x, y);
                break;
            }
            case "dumb-textarea": {
                this._createNode("Node - Textarea", DumbNodeWithTextArea, x, y);
                break;
            }
            case "dumb-multiple-outputs": {
                this._createNode("Node - Multiple Outputs", DumbNodeMultipleOutputs, x, y);
                break;
            }
            case "dumb-multiple-inputs": {
                this._createNode("Node - Multiple Inputs", DumbNodeMultipleInputs, x, y);
                break;
            }
        }
    }

    clearSelected() {
        let els = document.getElementsByClassName("selected");
        while (els.length > 0) {
            els[0].classList.remove("selected");
            els = document.getElementsByClassName("selected");
        }

        const doc = this.props.document;
        doc.clearSelected();
    }

    onClearSelected() {
        this.clearSelected();
    }

    onSelected(event) {
        const el = document.getElementById(event.detail.id);
        if (el) {
            el.classList.toggle("selected");

            const doc = this.props.document;
            doc.toggleSelect(event.detail.type, event.detail.id);
        } else {
            this.clearSelected();
        }
    }

    onDeleteSelected() {
        const doc = this.props.document;
        doc.deleteSelected();
        this.clearSelected();
    }

    onReset() {
        const doc = this.props.document;
        doc.reset();
    }

    onOutConnect(event) {
        const id = uuidv4();
        const portId = event.detail.id;
        const nodeId = event.detail.nodeId;

        const doc = this.props.document;
        doc.prepareConnection(id, portId, nodeId, event.detail.x, event.detail.y);
    }

    onInConnect(event) {
        const portId = event.detail.id;
        const nodeId = event.detail.nodeId;

        const doc = this.props.document;
        doc.completeConnection(portId, nodeId, event.detail.x, event.detail.y);
    }

    onMouseMove(event) {
        const doc = this.props.document;
        if (doc && doc.newConnection !== undefined) {
            const docElement = document.querySelector(".node-ui-doc");
            const docRect = docElement.getBoundingClientRect();
            const x = (event.clientX - docRect.left) / this.env.translation.zoom;
            const y = (event.clientY - docRect.top) / this.env.translation.zoom;

            doc.updateNewConnection(x, y);
        }
    }

    onMouseUp(event) {
        const doc = this.props.document;
        if (doc && doc.newConnection !== undefined) {
            doc.clearNewConnection();
        }
    }

    onKeydown(event) {
        if (event.key === "Delete" && event.ctrlKey) {
            event.preventDefault();
            event.stopPropagation();
            this.onDeleteComponent();
        }
    }

    onDebug(ev) {
        console.log("debug");
    }
}
