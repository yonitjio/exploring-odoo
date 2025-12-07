// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { EventBus, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
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
class NuidoDemoApp extends NuidoUi {
    static template = "nuido_demo.app";
    static props = {
        ...standardActionServiceProps,
    };
    static components = { Document, Dropdown, DropdownItem, DemoNodeMenu };
    static defaultProps = {
        ...NuidoUi.defaultProps,
        nbus: new EventBus()
    };
    dialog;
    edgeState;
    actions;
    setup() {
        this.dialog = useService("dialog");
        const docId = uuidv4();
        const sessionId = uuidv4();
        const doc = new DocumentModel(docId, sessionId, docId);
        doc.edgeType = this.props.edgeType;
        this.props.documents.push(doc);
        super.setup();
        this.edgeState = useState({
            edgeType: Default
        });
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
    }
    saveDoc() {
        const jsonDoc = this.state.env.documents[0].toJson();
        saveAs(data2blob(jsonDoc), "doc.txt");
    }
    repairDoc() {
        this.recalculateEdgeEndpoints();
    }
    openFile(file) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const docId = uuidv4();
            const sessionId = uuidv4();
            const newDoc = new DocumentModel(docId, sessionId, docId);
            newDoc.fromJson(reader.result);
            newDoc.edgeType = Default;
            this.edgeState.edgeType = Default;
            this.state.env.documents.push(newDoc);
            setTimeout(() => {
                if (this.state.env.documents.length > 1) {
                    this.state.env.documents.shift();
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
        this.state.env.nbus.trigger(this.state.env.channel + "/new" /* DocumentEventType.new */, { title: "Node", type: DumbNode.name, x: x, y: y });
    }
    addDumbNodeNoInput(x, y) {
        this.state.env.nbus.trigger(this.state.env.channel + "/new" /* DocumentEventType.new */, { title: "Node - No Input", type: DumbNodeNoInput.name, x: x, y: y });
    }
    addDumbNodeNoOutput(x, y) {
        this.state.env.nbus.trigger(this.state.env.channel + "/new" /* DocumentEventType.new */, { title: "Node - No Output", type: DumbNodeNoOutput.name, x: x, y: y });
    }
    addDumbNodeWithTextArea(x, y) {
        this.state.env.nbus.trigger(this.state.env.channel + "/new" /* DocumentEventType.new */, { title: "Node - Textarea", type: DumbNodeWithTextArea.name, x: x, y: y });
    }
    addDumbNodeMultipleOutputs(x, y) {
        this.state.env.nbus.trigger(this.state.env.channel + "/new" /* DocumentEventType.new */, { title: "Node - Multiple Outputs", type: DumbNodeMultipleOutputs.name, x: x, y: y });
    }
    addDumbNodeMultipleInputs(x, y) {
        this.state.env.nbus.trigger(this.state.env.channel + "/new" /* DocumentEventType.new */, { title: "Node - Multiple Inputs", type: DumbNodeMultipleInputs.name, x: x, y: y });
    }
    addDumbSectionedNode(x, y) {
        this.state.env.nbus.trigger(this.state.env.channel + "/new" /* DocumentEventType.new */, { title: "Node - Sectioned", type: DumbSectionedNode.name, x: x, y: y });
    }
    updateEdgeType() {
        this.state.env.nbus.trigger(this.state.env.channel + EdgeTypeEventType, {
            edgeType: this.edgeState.edgeType
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
    debug() {
        this.state.env.nbus.trigger(this.state.env.channel + DebugEventType);
    }
}
registry.category("actions").add("NuidoDemoApp", NuidoDemoApp);
