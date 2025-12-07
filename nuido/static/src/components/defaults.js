// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { NuidoNodeRegistryName, NuidoEdgeRegistryName, NuidoNodeSectionRegistryName, NuidoPortRegistryName, DefaultAux } from "@nuido/utils/registry";
import { Node } from "@nuido/components/node";
import { NodeModel } from "@nuido/models/node";
import { Edge } from "@nuido/components/edge";
import { EdgeModel } from "@nuido/models/edge";
import { NodeSection } from "@nuido/components/node_section";
import { NodeSectionModel } from "@nuido/models/sectioned_node";
import { Port } from "@nuido/components/port";
import { PortModel } from "@nuido/models/port";
import { Default } from "@nuido/utils/registry";
export class DefaultNode extends Node {
}
export class DefaultNodeModel extends NodeModel {
}
export class DefaultPort extends Port {
}
export class DefaultPortModel extends PortModel {
}
export class DefaultNodeSection extends NodeSection {
}
export class DefaultNodeSectionModel extends NodeSectionModel {
}
export class DefaultEdge extends Edge {
}
export class DefaultEdgeModel extends EdgeModel {
}
registry.category(NuidoNodeRegistryName).add(Default, {
    component: DefaultNode,
    model: DefaultNodeModel
});
registry.category(NuidoPortRegistryName).add(Default, {
    component: DefaultPort,
    model: DefaultPortModel
});
registry.category(NuidoNodeSectionRegistryName).add(Default, {
    component: DefaultNodeSection,
    model: DefaultNodeSectionModel
});
registry.category(NuidoEdgeRegistryName).add(Default, {
    component: DefaultEdge,
    model: DefaultEdgeModel
});
registry.category(NuidoEdgeRegistryName).add(DefaultAux, {
    component: DefaultEdge,
    model: DefaultEdgeModel
});
