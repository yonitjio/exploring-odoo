/*!
 * THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
 *
 * This software is released under the MIT License.
 * SPDX-License-Identifier: MIT
 * https://opensource.org/licenses/MIT
 *
 * THIS SOFTWARE IS EXPERIMENTAL, NO GUARANTEES OR LIABILITY ASSUMED.
 *
 */
import { signal, proxy, onMounted } from "@odoo/owl";
import { parseFloat, parseInteger } from "@web/views/fields/parsers";
import { formatFloat, formatInteger, formatMonetary } from "@web/views/fields/formatters";
;
import { QuickboardItemBase } from "@quickboard/quickboard/quickboard_item_base";
import { getBackgroundColor, getForegroundColor } from "@quickboard/core/colors";
import { iconList } from "@quickboard/views/fields/qb_icon_picker/icon_list";
const { DateTime } = luxon;
export class QuickboardItemBasic extends QuickboardItemBase {
    static template = "quickboard.QuickboardItemBasic";
    gsItemRef;
    containerRef;
    spinner;
    state;
    aggregate_function;
    setup() {
        super.setup();
        this.gsItemRef = signal.ref();
        this.containerRef = signal.ref();
        this.spinner = new Spin.Spinner(this._getSpinnerOpt());
        this.aggregate_function = "";
        this.state = proxy({
            "title": "",
            "icon": "",
            "icon_filled": false,
            "valueFieldType": "",
            "aggregateValue": "",
            "value": "",
            "aggregateFunction": "",
            "textColor": "",
            "backgroundColor": "",
            "theme": this.props.theme,
            "startDate": this.props.startDate,
            "endDate": this.props.endDate,
        });
        onMounted(async () => {
            var target = this.gsItemRef();
            this.spinner.spin(target);
            await this.loadData(this.props.itemId, this.state.startDate, this.state.endDate).then(() => { this.spinner.stop(); });
        });
    }
    async onMessage(id) {
        if (id == this.itemId) {
            var target = this.gsItemRef();
            const ref = this.containerRef();
            if (ref)
                ref.classList.add("d-none");
            this.spinner.spin(target);
            await this.loadData(this.props.itemId, this.state.startDate, this.state.endDate).then(() => {
                const ref = this.containerRef();
                if (ref)
                    ref.classList.remove("d-none");
                this.spinner.stop();
            });
        }
    }
    async loadData(itemId, startDate, endDate) {
        const res = await this.quickboard.getQuickboardItem(itemId, startDate, endDate);
        const icon = iconList.find(o => o.value === res.icon);
        this.state.title = res.name;
        this.state.icon = icon?.icon;
        this.state.icon_filled = icon?.icon_filled;
        this.state.valueFieldType = res.value_field_type;
        this.state.aggregateValue = res.aggregate_value;
        this.state.value = this.getFormattedValue();
        this.state.aggregateFunction = this.aggregate_function;
        this.state.textColor = getForegroundColor(res.text_color, this.state.theme);
        this.state.backgroundColor = getBackgroundColor(res.background_color, this.state.theme);
    }
    getFormattedValue() {
        let val;
        let val_formatted;
        switch (this.state.valueFieldType) {
            case "integer":
                val = parseInteger(String(this.state.aggregateValue));
                val_formatted = formatInteger(val);
                break;
            case "float":
                val = parseFloat(String(this.state.aggregateValue));
                val_formatted = formatFloat(val);
                break;
            case "monetary":
                val = parseFloat(String(this.state.aggregateValue));
                val_formatted = formatMonetary(val);
                break;
            default:
                if (Number.isSafeInteger(this.state.aggregateValue))
                    val_formatted = formatInteger(this.state.aggregateValue);
                else
                    val_formatted = formatFloat(this.state.aggregateValue);
        }
        return val_formatted;
    }
}
