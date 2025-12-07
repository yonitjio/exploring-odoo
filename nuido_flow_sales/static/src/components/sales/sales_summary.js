// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
export class SalesSummaryOdooNode extends Node {
    get summaryTypeInputId() {
        return `input-${this.props.node.id}-summary-type`;
    }
}
SalesSummaryOdooNode.template = "nuido_flow_sales.sales-summary-odoo";
