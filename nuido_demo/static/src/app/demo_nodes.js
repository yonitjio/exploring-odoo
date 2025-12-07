// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Default, NuidoNodeRegistryName, NuidoNodeSectionRegistryName } from "@nuido/utils/registry";
import { makeReactive, uuidv4 } from "@nuido/utils/utils";
import { Node } from "@nuido/components/node";
import { NodeModel } from "@nuido/models/node";
import { NodeSection } from "@nuido/components/node_section";
import { SectionedNode } from "@nuido/components/sectioned_node";
import { SectionedNodeModel } from "@nuido/models/sectioned_node";
import { NodeSectionModel } from "@nuido/models/sectioned_node";
export class DemoNode extends Node {
    setup() {
        this.ui = useService("ui");
        super.setup();
    }
    get contentStyle() {
        if (this.ui.isSmall) {
            return "width: 128px;";
        }
        else {
            return "";
        }
    }
}
export class DumbNode extends DemoNode {
    static template = "nuido_demo.dumb-node";
}
export class DumbNodeModel extends NodeModel {
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
    }
}
export class DumbNodeSectionWithInputField extends NodeSection {
    static template = "nuido_demo.dumb-node-section-with-input";
    state;
    setup() {
        super.setup();
        const state = {
            text: this.props.section.text || ""
        };
        this.state = useState(makeReactive(this, state, (owner, data) => {
            this.props.section.text = data.text;
        }));
    }
}
export class DumbNodeSectionWithInputFieldModel extends NodeSectionModel {
}
export class DumbLabelNodeSectionModel extends NodeSectionModel {
    label = "Label";
}
export class DumbLabelNodeSection extends NodeSection {
    static template = "nuido_demo.dumb-label-node-section";
}
export class DumbSectionedNode extends SectionedNode {
}
export class DumbSectionedNodeModel extends SectionedNodeModel {
    setup() {
        let sectionId = uuidv4();
        this.addSection(sectionId, DumbNodeSectionWithInputField.name);
        sectionId = uuidv4();
        this.addSection(sectionId, DumbLabelNodeSection.name, {
            direction: "out" /* SectionDirectionType.Out */,
            maxOut: Number.MAX_SAFE_INTEGER,
        });
        sectionId = uuidv4();
        this.addSection(sectionId, Default, {
            direction: "inout" /* SectionDirectionType.InOut */,
            maxIn: Number.MAX_SAFE_INTEGER,
            maxOut: Number.MAX_SAFE_INTEGER,
        });
    }
}
export class DumbNodeNoInput extends DemoNode {
    static template = "nuido_demo.dumb-node-no-input";
}
export class DumbNodeNoInputModel extends NodeModel {
    setup() {
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
    }
}
export class DumbNodeMultipleOutputs extends DemoNode {
    static template = "nuido_demo.dumb-node-multiple-outputs";
}
export class DumbNodeMultipleOutputsModel extends NodeModel {
    setup() {
        const outId1 = "out-" + this.id + "-1";
        this.addOutPort(outId1, Default, 1);
        const outId2 = "out-" + this.id + "-2";
        this.addOutPort(outId2, Default, 2);
    }
}
export class DumbNodeMultipleInputs extends DemoNode {
    static template = "nuido_demo.dumb-node-multiple-inputs";
}
export class DumbNodeMultipleInputsModel extends NodeModel {
    static template = "nuido_demo.dumb-node-multiple-inputs";
    setup() {
        const inId1 = "in-" + this.id + "-1";
        this.addInPort(inId1, Default, 1);
        const inId2 = "in-" + this.id + "-2";
        this.addInPort(inId2, Default, 2);
    }
}
export class DumbNodeNoOutput extends DemoNode {
    static template = "nuido_demo.dumb-node-no-output";
}
export class DumbNodeNoOutputModel extends NodeModel {
    setup() {
        const inId1 = "in-" + this.id + "-1";
        this.addInPort(inId1, Default, 1);
    }
}
export class DumbNodeWithTextArea extends Node {
    static template = "nuido_demo.dumb-node-with-textarea";
    state;
    stateInfo;
    setup() {
        super.setup();
        const state = {
            text: this.props.node.text || ""
        };
        this.state = useState(makeReactive(this, state, (owner, data) => {
            this.props.node.text = data.text;
        }));
        this.stateInfo = useState({
            text: this.props.node.text || ""
        });
    }
    onTestButtonClick() {
        this.stateInfo.text = this.props.node.text;
    }
}
export class DumbNodeWithTextAreaModel extends NodeModel {
    text;
    setup() {
        const outId1 = "out-" + this.id + "-1";
        this.addOutPort(outId1, Default, 1);
    }
}
registry.category(NuidoNodeRegistryName).add(DumbNode.name, {
    component: DumbNode,
    model: DumbNodeModel
});
registry.category(NuidoNodeRegistryName).add(DumbSectionedNode.name, {
    component: DumbSectionedNode,
    model: DumbSectionedNodeModel
});
registry.category(NuidoNodeSectionRegistryName).add(DumbNodeSectionWithInputField.name, {
    component: DumbNodeSectionWithInputField,
    model: DumbNodeSectionWithInputFieldModel
});
registry.category(NuidoNodeSectionRegistryName).add(DumbLabelNodeSection.name, {
    component: DumbLabelNodeSection,
    model: DumbLabelNodeSectionModel
});
registry.category(NuidoNodeRegistryName).add(DumbNodeNoInput.name, {
    component: DumbNodeNoInput,
    model: DumbNodeNoInputModel
});
registry.category(NuidoNodeRegistryName).add(DumbNodeNoOutput.name, {
    component: DumbNodeNoOutput,
    model: DumbNodeNoOutputModel
});
registry.category(NuidoNodeRegistryName).add(DumbNodeWithTextArea.name, {
    component: DumbNodeWithTextArea,
    model: DumbNodeWithTextAreaModel
});
registry.category(NuidoNodeRegistryName).add(DumbNodeMultipleInputs.name, {
    component: DumbNodeMultipleInputs,
    model: DumbNodeMultipleInputsModel
});
registry.category(NuidoNodeRegistryName).add(DumbNodeMultipleOutputs.name, {
    component: DumbNodeMultipleOutputs,
    model: DumbNodeMultipleOutputsModel
});
