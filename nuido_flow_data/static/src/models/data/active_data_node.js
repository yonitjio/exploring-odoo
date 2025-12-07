// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { ModelNodeModel } from "@nuido_flow_data/models/data/model_node";
import { Default } from "@nuido/utils/registry";
export class ActiveDataNodeModel extends ModelNodeModel {
    setup() {
        super.setup();
        const auxOutId = "aux-out-" + this.id + "-1";
        this.addAuxOutPort(auxOutId, Default, 1, {
            role: "data"
        });
        this.key = "my_active_data";
        this.fields = [];
    }
}
