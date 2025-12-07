// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component } from "@odoo/owl";
import { Port } from "@nuido/components/port";
import { SectionedNodeModel } from "@nuido/models/sectioned_node";
import { NodeSectionModel } from "@nuido/models/sectioned_node";
export class NodeSection extends Component {
    static template = "nuido.node-section";
    static components = { Port };
    static props = {
        node: SectionedNodeModel,
        section: NodeSectionModel
    };
    findInPortById(id) {
        return this.props.node.inPorts.find((o) => o.id === id);
    }
    findOutPortById(id) {
        return this.props.node.outPorts.find((o) => o.id === id);
    }
}
