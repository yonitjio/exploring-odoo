// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useState } from "@odoo/owl";
export class MapTreeItem extends Component {
    setup() {
        super.setup();
        this.state = useState({
            name: this.props.name,
            value: this.props.value
        });
    }
    onNodeChanged() {
        var _a, _b;
        (_b = (_a = this.props).onNodeChanged) === null || _b === void 0 ? void 0 : _b.call(_a, {
            id: this.props.id,
            name: this.state.name,
            value: this.state.value
        });
    }
    onNameChanged() {
        this.onNodeChanged();
    }
    onValueChanged() {
        this.onNodeChanged();
    }
}
MapTreeItem.template = "nuido_flow.map-tree-item";
MapTreeItem.props = {
    id: String,
    name: String,
    value: String,
    hasChildren: Boolean,
    onNodeChanged: { type: Function, optional: true },
    onRemove: { type: Function, optional: true },
    onAddChild: { type: Function, optional: true }
};
MapTreeItem.defaultProps = {
    onNodeChange: () => { },
    onRemove: () => { },
    onAddChild: () => { }
};
