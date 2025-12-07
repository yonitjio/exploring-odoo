// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component } from "@odoo/owl";
import { MapTreeItem } from "./map_tree_item";
import { uuidv4 } from "@nuido/utils/utils";
import { MapItem } from "@nuido_flow/models/core/mapper_node";
export class MapTree extends Component {
    getNode(id) {
        const res = this.props.nodes.find(o => {
            return o.id === id;
        });
        return res;
    }
    hasChildren(parent_id) {
        const res = this.props.nodes.some((o) => {
            return o.parent_id === parent_id;
        });
        return res;
    }
    getChildren(parent_id) {
        const res = this.props.nodes.filter((o) => {
            return o.parent_id === parent_id;
        });
        return res;
    }
    getAllChildren(id) {
        let res = [];
        if (this.hasChildren(id)) {
            const children = this.getChildren(id);
            res = res.concat(children);
            for (let i = 0; i < children.length; i++) {
                const grandChildren = this.getAllChildren(children[i].id);
                res = res.concat(grandChildren);
            }
        }
        return res;
    }
    addNode(parent_id) {
        var _a, _b;
        const node = this.getNode(parent_id);
        node.value = "";
        this.props.nodes.push(new MapItem(uuidv4(), "", "", parent_id));
        (_b = (_a = this.props).onNodesChanged) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    removeNode(id) {
        var _a, _b;
        const node = this.getNode(id);
        if (node.name === "maproot") {
            return;
        }
        const children = this.getAllChildren(id);
        for (let i = 0; i < children.length; i++) {
            const idx = this.props.nodes.findIndex(o => o.id === children[i].id);
            this.props.nodes.splice(idx, 1);
        }
        const idx = this.props.nodes.findIndex(o => o.id === node.id);
        this.props.nodes.splice(idx, 1);
        (_b = (_a = this.props).onNodesChanged) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    onNodeChanged(node_values) {
        const node = this.getNode(node_values.id);
        node.name = node_values.name;
        node.value = node_values.value;
    }
}
MapTree.template = "nuido_flow.map-tree";
MapTree.components = {
    MapTree,
    MapTreeItem
};
MapTree.props = {
    node: Object,
    nodes: (Array),
    onNodesChanged: { type: Function, optional: true }
};
MapTree.defaultProps = {
    onNodesChanged: () => { }
};
