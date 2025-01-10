import { Component} from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";

import { parseFloat, parseInteger, parseMonetary } from "@web/views/fields/parsers";
import { formatFloat, formatInteger, formatMonetary } from "@web/views/fields/formatters";;

export class SaleOrderSummaryDialog extends Component {
    static components = { Dialog };
    static template = "exercise_one.SaleOrderSummary";

    static props = {
        close: Function,
        data: Object,
        confirm: Function,
    }

    async _confirm() {
        this.props.confirm();
        this.props.close();
    }

    formatMonetary(val) {
        const str = parseMonetary(String(val));
        const res = formatMonetary(str);
        return res;
    }

    formatInteger(val) {
        const str = parseInteger(String(val));
        const res = formatInteger(str);
        return res;
    }
    formatFloat(val) {
        const str = parseFloat(String(val));
        const res = formatFloat(str);
        return res;
    }

    getTotal(fieldName){
        let res = this.props.data.reduce((acc, cur) => {
            let val = acc += cur[fieldName];
            return val;
        }, 0);
;
        return res;
    }
}
