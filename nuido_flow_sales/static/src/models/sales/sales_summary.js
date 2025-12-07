// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { Default } from "@nuido/utils/registry";
export var SalesSummaryType;
(function (SalesSummaryType) {
    SalesSummaryType["Day"] = "day";
    SalesSummaryType["Week"] = "week";
    SalesSummaryType["Month"] = "month";
    SalesSummaryType["Year"] = "year";
})(SalesSummaryType || (SalesSummaryType = {}));
export class SalesSummaryOdooNodeModel extends NodeModel {
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        this.summary_type = "month" /* SalesSummaryType.Month */;
    }
}
