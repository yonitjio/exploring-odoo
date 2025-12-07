// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { Default } from "@nuido/utils/registry";
import { serializeDate } from "@web/core/l10n/dates";
export class FixedRangeSalesSummaryOdooNodeModel extends NodeModel {
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        this.start_date = serializeDate(luxon.DateTime.local().startOf("month"));
        this.end_date = serializeDate(luxon.DateTime.local());
    }
}
