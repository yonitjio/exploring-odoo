// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { deserializeDate, serializeDate, } from "@web/core/l10n/dates";
import { DateTimeInput } from "@web/core/datetime/datetime_input";
import { Node } from "@nuido/components/node";
export class FixedRangeSalesSummaryOdooNode extends Node {
    get startDateInputId() {
        return `input-${this.props.node.id}-start-date`;
    }
    get startDate() {
        const value = this.props.node.start_date;
        const dateValue = typeof value === "string" ? deserializeDate(value) : value;
        return dateValue && !dateValue.invalid ? dateValue : false;
    }
    async onStartDateValueChange(newValue) {
        newValue = newValue && serializeDate(newValue);
        this.props.node.start_date = newValue;
    }
    get endDateInputId() {
        return `input-${this.props.node.id}-end-date`;
    }
    get endDate() {
        const value = this.props.node.end_date;
        const dateValue = typeof value === "string" ? deserializeDate(value) : value;
        return dateValue && !dateValue.invalid ? dateValue : false;
    }
    async onEndDateValueChange(newValue) {
        newValue = newValue && serializeDate(newValue);
        this.props.node.end_date = newValue;
    }
}
FixedRangeSalesSummaryOdooNode.template = "nuido_flow_sales.fixed-range-sales-summary-odoo";
FixedRangeSalesSummaryOdooNode.components = {
    ...Node.components,
    DateTimeInput
};
