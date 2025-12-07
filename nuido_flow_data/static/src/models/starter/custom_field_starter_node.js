// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { StarterPort } from "@nuido_flow/components/ports/starter_port";
export class CustomFieldStarterNodeModel extends NodeModel {
    setup() {
        const auxOutId = "aux-out-" + this.id + "-1";
        this.addAuxOutPort(auxOutId, StarterPort.name, 1, {
            role: "starter"
        });
        this.model = "";
        this.field_name = "";
        this.field_description = "";
        this.remove_field = false;
    }
}
