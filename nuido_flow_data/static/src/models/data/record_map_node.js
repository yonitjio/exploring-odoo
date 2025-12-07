// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { ModelNodeModel } from "@nuido_flow_data/models/data/model_node";
import { Default } from "@nuido/utils/registry";
export class RecordMapNodeModel extends ModelNodeModel {
    setup() {
        super.setup();
        const auxOutId = "aux-out-" + this.id + "-1";
        this.addAuxOutPort(auxOutId, Default, 1, {
            role: "data"
        });
        this.key = "my_record_map";
        this.record_map = [];
    }
    addOrUpdateRecordMap(id, display_name, value) {
        const record_map = this.record_map.find(o => o.id === id);
        if (record_map) {
            record_map.display_name = display_name;
            record_map.value = value;
        }
        else {
            this.record_map.push({
                id: id,
                display_name: display_name,
                value: value
            });
        }
    }
    removeRecordMap(id) {
        const record_map_idx = this.record_map.findIndex(o => o.id === id);
        if (record_map_idx > -1) {
            this.record_map.splice(record_map_idx, 1);
        }
    }
}
