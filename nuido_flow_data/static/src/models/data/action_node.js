// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Default } from "@nuido/utils/registry";
import { ModelNodeModel } from "@nuido_flow_data/models/data/model_node";
export class ActionNodeModel extends ModelNodeModel {
    setup() {
        super.setup();
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        this.ids = "";
        this.action = {
            id: -1,
            display_name: ""
        };
    }
}
