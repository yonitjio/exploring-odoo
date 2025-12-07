// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, EventBus, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService, useBus } from "@web/core/utils/hooks";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";
import { NuidoUi } from "@nuido/app/nuido_ui";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { uuidv4, data2blob, loadFile } from "@nuido/utils/utils";
import { DemoNodeMenu } from "@nuido_demo/app/demo_node_menu";
import { DocumentModel } from "@nuido/models/document";
import { Document } from "@nuido/components/document";
import { DebugEventType, EdgeTypeEventType } from "@nuido/components/events";
import { DumbNode, DumbNodeMultipleInputs, DumbNodeMultipleOutputs, DumbNodeNoInput, DumbNodeNoOutput, DumbNodeWithTextArea, DumbSectionedNode } from "./demo_nodes";
import { DemoOrthogonalEdge, DemoCurvedEdge } from "./demo_edges";
import { Default } from "@nuido/utils/registry";
export class NuidoDemoComponent extends Component {
    static template = "nuido_demo.demo_component";
    static props = {
        ...standardActionServiceProps,
    };
    static components = { NuidoUi, Document, Dropdown, DropdownItem, DemoNodeMenu };
    dialog;
    ui;
    actions;
    state;
    channel;
    setup() {
        this.ui = useService("ui");
        this.dialog = useService("dialog");
        this.channel = "nuido-demo";
        this.actions = [
            {
                title: "Node",
                icon: "/nuido_demo/static/images/align-center.svg",
                action: this.addDumbNode.bind(this)
            },
            {
                title: "Node - No Input",
                icon: "/nuido_demo/static/images/align-start.svg",
                action: this.addDumbNodeNoInput.bind(this)
            },
            {
                title: "Node - No Output",
                icon: "/nuido_demo/static/images/align-end.svg",
                action: this.addDumbNodeNoOutput.bind(this)
            },
            {
                title: "Node - Text Area",
                icon: "/nuido_demo/static/images/textbox.svg",
                action: this.addDumbNodeWithTextArea.bind(this)
            },
            {
                title: "Node - Multi Outputs",
                icon: "/nuido_demo/static/images/share.svg",
                action: this.addDumbNodeMultipleOutputs.bind(this)
            },
            {
                title: "Node - Multi Inputs",
                icon: "/nuido_demo/static/images/share-no-fill.svg",
                action: this.addDumbNodeMultipleInputs.bind(this)
            },
            {
                title: "Node - Sectioned",
                icon: "/nuido_demo/static/images/section.svg",
                action: this.addDumbSectionedNode.bind(this)
            }
        ];
        this.state = useState({
            nbus: new EventBus(),
            documents: [],
            edgeType: Default,
            zoom: 1,
        });
        const docId = uuidv4();
        const sessionId = uuidv4();
        const doc = new DocumentModel(docId, sessionId, docId);
        doc.edgeType = String(this.state.edgeType);
        this.state.documents.push(doc);
        useBus(this.state.nbus, this.channel + "/translation_changed" /* NuidoEventType.translation_changed */, this.translation_changed.bind(this));
    }
    saveDoc() {
        const jsonDoc = this.state.documents[0].toJson();
        saveAs(data2blob(jsonDoc), "doc.txt");
    }
    openFile(file) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const docId = uuidv4();
            const sessionId = uuidv4();
            const newDoc = new DocumentModel(docId, sessionId, docId);
            newDoc.fromJson(reader.result);
            newDoc.edgeType = String(this.state.edgeType);
            this.state.documents.push(newDoc);
            setTimeout(() => {
                if (this.state.documents.length > 0) {
                    this.state.documents.shift();
                }
            }, 20); // give time before destroying component
        });
        reader.readAsText(file);
    }
    async openDoc() {
        this.zoom_reset();
        await new Promise(resolve => setTimeout(resolve, 250));
        const file = await loadFile();
        if (file != undefined) {
            this.openFile(file);
        }
        ;
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    addDumbNode(x, y) {
        this.state.nbus.trigger(this.channel + "/new" /* DocumentEventType.new */, { title: "Node", type: DumbNode.name, x: x, y: y });
    }
    addDumbNodeNoInput(x, y) {
        this.state.nbus.trigger(this.channel + "/new" /* DocumentEventType.new */, { title: "Node - No Input", type: DumbNodeNoInput.name, x: x, y: y });
    }
    addDumbNodeNoOutput(x, y) {
        this.state.nbus.trigger(this.channel + "/new" /* DocumentEventType.new */, { title: "Node - No Output", type: DumbNodeNoOutput.name, x: x, y: y });
    }
    addDumbNodeWithTextArea(x, y) {
        this.state.nbus.trigger(this.channel + "/new" /* DocumentEventType.new */, { title: "Node - Textarea", type: DumbNodeWithTextArea.name, x: x, y: y });
    }
    addDumbNodeMultipleOutputs(x, y) {
        this.state.nbus.trigger(this.channel + "/new" /* DocumentEventType.new */, { title: "Node - Multiple Outputs", type: DumbNodeMultipleOutputs.name, x: x, y: y });
    }
    addDumbNodeMultipleInputs(x, y) {
        this.state.nbus.trigger(this.channel + "/new" /* DocumentEventType.new */, { title: "Node - Multiple Inputs", type: DumbNodeMultipleInputs.name, x: x, y: y });
    }
    addDumbSectionedNode(x, y) {
        this.state.nbus.trigger(this.channel + "/new" /* DocumentEventType.new */, { title: "Node - Sectioned", type: DumbSectionedNode.name, x: x, y: y });
    }
    deleteSelected() {
        this.state.nbus.trigger(this.channel + "/delete" /* DocumentEventType.delete */);
    }
    reset() {
        this.state.nbus.trigger(this.channel + "/reset" /* DocumentEventType.reset */);
    }
    onDoubleClick() {
        this.state.nbus.trigger(this.channel + "/clear" /* SelectionEventType.clear */);
    }
    onUpdateEdgeType() {
        this.state.nbus.trigger(this.channel + EdgeTypeEventType, {
            edgeType: this.state.edgeType
        });
    }
    get DefaultEdgeName() {
        return Default;
    }
    get OrthogonalEdgeName() {
        return DemoOrthogonalEdge.name;
    }
    get CurvedEdgeName() {
        return DemoCurvedEdge.name;
    }
    get nodeMenuStyle() {
        if (this.ui.isSmall) {
            return "width: 60px;";
        }
        else {
            return "width: 225px;";
        }
    }
    zoom_reset() {
        this.state.nbus.trigger(this.channel + "/zoom_reset" /* NuidoEventType.zoom_reset */);
    }
    translation_changed(event) {
        this.state.zoom = event.detail.zoom;
    }
    get zoom() {
        return Math.round((this.state.zoom + Number.EPSILON) * 100) / 100;
    }
    debug() {
        this.state.nbus.trigger(this.channel + DebugEventType);
    }
}
registry.category("actions").add("NuidoDemoComponent", NuidoDemoComponent);
