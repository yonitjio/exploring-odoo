// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { ModelNodeModel } from "@nuido_flow_data/models/data/model_node";
import { LookupPort } from "@nuido_flow_data/components/ports/lookup_port";
export class LookupNodeModel extends ModelNodeModel {
    setup() {
        super.setup();
        const auxOutId = "aux-out-" + this.id + "-1";
        this.addAuxOutPort(auxOutId, LookupPort.name, 1, {
            role: "lookup"
        });
        this.key = "my_lookup";
        this.lookup_field = "";
        this.value_field = "";
    }
}
