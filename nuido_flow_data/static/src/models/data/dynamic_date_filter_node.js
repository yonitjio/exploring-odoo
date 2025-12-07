// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { ModelNodeModel } from "@nuido_flow_data/models/data/model_node";
import { DataFilterPort } from "@nuido_flow_data/components/ports/data_filter_port";
export class DynamicDateFilterNodeModel extends ModelNodeModel {
    setup() {
        super.setup();
        const auxOutId = "aux-out-" + this.id + "-1";
        this.addAuxOutPort(auxOutId, DataFilterPort.name, 1, {
            role: "data-filter"
        });
        this.dynamic_date_field = "";
        this.dynamic_date_interval = "" /* DateInterval.None */;
    }
}
