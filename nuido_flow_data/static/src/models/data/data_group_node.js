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
import { DataFilterPort } from "@nuido_flow_data/components/ports/data_filter_port";
import { ModelNodeModel } from "@nuido_flow_data/models/data/model_node";
export class DataGroupNodeModel extends ModelNodeModel {
    key;
    fields;
    domain;
    aggregate_function;
    group_field;
    datetime_granularity;
    list_row_limit;
    output_type;
    setup() {
        super.setup();
        const auxInId = "aux-in-" + this.id + "-1";
        this.addAuxInPort(auxInId, DataFilterPort.name, Number.MAX_SAFE_INTEGER, {
            role: "data-filter"
        });
        const auxOutId = "aux-out-" + this.id + "-1";
        this.addAuxOutPort(auxOutId, Default, 1, {
            role: "data"
        });
        this.key = "my_data";
        this.fields = [];
        this.domain = "[]";
        this.aggregate_function = "count";
        this.group_field = "";
        this.datetime_granularity = "day";
        this.list_row_limit = 50;
        this.output_type = "array";
    }
    getData() {
        const res = super.getData();
        return Object.assign(res, {
            key: this.key,
            fields: this.fields,
            domain: this.domain,
            aggregate_function: this.aggregate_function,
            group_field: this.group_field,
            datetime_granularity: this.datetime_granularity,
            list_row_limit: this.list_row_limit,
            output_type: this.output_type
        });
    }
}
