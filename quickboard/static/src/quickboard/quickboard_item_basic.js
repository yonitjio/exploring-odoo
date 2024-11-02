/** @odoo-module **/
import { useState, onMounted, useRef } from "@odoo/owl";
import { parseFloat, parseInteger, parseMonetary } from "@web/views/fields/parsers";
import { formatFloat, formatInteger, formatMonetary } from "@web/views/fields/formatters";;
import { QuickboardItemBase } from "./quickboard_item_base";

export class QuickboardItemBasic extends QuickboardItemBase {
    static template = "quickboard.QuickboardItemBasic";

    setup(){
        super.setup();

        this.gsItemRef = useRef("grid-stack-item");
        this.containerRef = useRef("container");
        this.spinner = new Spin.Spinner(this._getSpinnerOpt());

        this.state = useState({
            "title": "",
            "icon": "",
            "valueFieldType": "",
            "aggregateValue": "",
            "value": "",
            "aggregateFunction": "",
            "textColor": "",
            "backgroundColor": "",

            "startDate": this.props.startDate,
            "endDate": this.props.endDate,
        });

        onMounted(async () => {
            var target = this.gsItemRef.el;
            this.spinner.spin(target);
            await this.loadData(
                this.props.itemId,
                this.state.startDate,
                this.state.endDate
            ).then(() => {this.spinner.stop()});
        })
    }

    async onMessage(id) {
        if (id == this.itemId){
            var target = this.gsItemRef.el;
            if (this.containerRef.el){
                this.containerRef.el.classList.add("d-none");
            }
            this.spinner.spin(target);
            await this.loadData(
                this.props.itemId,
                this.state.startDate,
                this.state.endDate
            ).then(() => {
                if (this.containerRef.el){
                    this.containerRef.el.classList.remove("d-none");
                }
                this.spinner.stop()
            });
        }
    }

    async loadData(itemId, startDate, endDate) {
        const res = await this.quickboard.getQuickboardItem(itemId, startDate, endDate)
        this.state.title = res.name;
        this.state.icon = res.icon;
        this.state.valueFieldType = res.value_field_type;
        this.state.aggregateValue = res.aggregate_value;
        this.state.value = this.getFormattedValue();
        this.state.aggregateFunction = this.aggregate_function;
        this.state.textColor = res.text_color;
        this.state.backgroundColor = res.background_color;
    }

    getFormattedValue(){
        let val;
        let val_formatted;

        switch (this.state.valueFieldType){
            case "integer":
                val = parseInteger(String(this.state.aggregateValue));
                val_formatted = formatInteger(val);
                break;
            case "float":
                val = parseFloat(String(this.state.aggregateValue));
                val_formatted = formatFloat(val);
                break;
            case "monetary":
                val = parseMonetary(String(this.state.aggregateValue));
                val_formatted = formatMonetary(val);
                break;
            default:
                if (Number.isSafeInteger(this.state.aggregateValue))
                    val_formatted = formatInteger(this.state.aggregateValue);
                else
                    val_formatted = formatFloat(this.state.aggregateValue);
        }
        return val_formatted
    }
}