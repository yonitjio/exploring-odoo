/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { StarterPort } from "@nuido_flow/components/ports/starter_port";
import { ModelNodeModel } from "@nuido_flow_data/models/data/model_node";
export class CustomFieldStarterNodeModel extends ModelNodeModel {
    field_name;
    field_description;
    remove_field;
    setup() {
        super.setup();
        const auxOutId = "aux-out-" + this.id + "-1";
        this.addAuxOutPort(auxOutId, StarterPort.name, 1, {
            role: "starter"
        });
        this.model = "";
        this.field_name = "";
        this.field_description = "";
        this.remove_field = false;
    }
    getData() {
        const res = super.getData();
        return Object.assign(res, {
            field_name: this.field_name,
            field_description: this.field_description,
            remove_field: this.remove_field
        });
    }
}
