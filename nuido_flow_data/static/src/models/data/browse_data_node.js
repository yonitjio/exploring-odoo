/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { Default } from "@nuido/utils/registry";
import { ModelNodeModel } from "@nuido_flow_data/models/data/model_node";
export class BrowseDataNodeModel extends ModelNodeModel {
    reference_values;
    reference_field;
    setup() {
        super.setup();
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        const auxInId = "aux-in-" + this.id + "-1";
        this.addAuxInPort(auxInId, Default, 1, {
            role: "data"
        });
        const auxOutId = "aux-out-" + this.id + "-1";
        this.addAuxOutPort(auxOutId, Default, 1, {
            role: "data"
        });
        this.reference_values = "";
        this.reference_field = "";
    }
    getData() {
        const res = super.getData();
        return Object.assign(res, {
            reference_values: this.reference_values,
            reference_field: this.reference_field
        });
    }
}
