// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, reactive, useState } from "@odoo/owl";
import { makeReactive } from "@nuido/utils/utils";
import { useService } from "@web/core/utils/hooks";
import { MapTreeDialog } from "@nuido_flow/components/ui/map_tree_dialog";
export class MapTreeDialogInput extends Component {
    setup() {
        super.setup();
        this.dialog = useService("dialog");
        const state = {
            map: reactive(this.props.map)
        };
        this.state = useState(makeReactive(this, state, (owner, data) => {
            this.props.onChanged(data.map);
        }));
        this.state.map.toString = function () {
            let res = JSON.stringify(this, (key, value) => {
                if (["id", "parent_id"].includes(key)) {
                    return undefined;
                }
                else if (key === "name" && value === "maproot") {
                    return undefined;
                }
                else if (value === "") {
                    return undefined;
                }
                else {
                    return value;
                }
            });
            res = res.replace(/\{\}\,?/, "");
            return res;
        };
    }
    get trimmedText() {
        let text = this.state.map.toString();
        return text.length > 30 ? text.substring(0, 30) + '...' : text;
    }
    updateMap(map) {
        this.state.map = map;
    }
    async showDialog() {
        this.dialog.add(MapTreeDialog, {
            title: this.props.label,
            map: this.props.map,
            apply: this.updateMap.bind(this)
        });
    }
}
MapTreeDialogInput.template = "nuido_base.text-dialog-input";
MapTreeDialogInput.props = {
    ...Component.props,
    id: String,
    label: String,
    onChanged: Function,
    map: Array
};
