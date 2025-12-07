// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
import { MapTree } from "../ui/map_tree";
import { MapTreeDialogInput } from "../ui/map_tree_dialog_input";
export class MapperNode extends Node {
    onNodesChanged() {
        this.refreshEdges();
    }
    onMapChanged(value) {
        this.props.node.map = value;
    }
}
MapperNode.template = "nuido_flow.mapper-node";
MapperNode.components = {
    ...Node.components,
    MapTree,
    MapTreeDialogInput
};
