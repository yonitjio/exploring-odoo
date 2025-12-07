// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { MapTree } from "./map_tree";
export class MapTreeDialog extends Component {
    setup() {
        this.state = useState({
            map: this.props.map
        });
    }
    onClickApply() {
        this.props.apply(this.state.map);
        this.props.close();
    }
}
MapTreeDialog.template = "nuido_base.map-tree-dialog";
MapTreeDialog.components = {
    Dialog,
    MapTree
};
MapTreeDialog.props = {
    title: String,
    map: Array,
    apply: Function,
    close: Function,
};
