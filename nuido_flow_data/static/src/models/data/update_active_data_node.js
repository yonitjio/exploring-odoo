// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { ModelNodeModel } from "@nuido_flow_data/models/data/model_node";
import { Default } from "@nuido/utils/registry";
export class UpdateActiveDataNodeModel extends ModelNodeModel {
    setup() {
        super.setup();
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        this.fields = [];
    }
    addOrUpdateField(name, value) {
        const field = this.fields.find(o => o.name === name);
        if (field) {
            field.value = value;
        }
        else {
            this.fields.push({
                name: name,
                value: value
            });
        }
    }
    removeRecordMap(name) {
        const field_idx = this.fields.findIndex(o => o.name === name);
        if (field_idx > -1) {
            this.fields.splice(field_idx, 1);
        }
    }
}
