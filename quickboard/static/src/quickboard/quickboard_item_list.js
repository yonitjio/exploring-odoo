/** @odoo-module **/
import { useState, useRef, onMounted } from "@odoo/owl";

import { parseFloat, parseInteger, parseMonetary } from "@web/views/fields/parsers";
import { formatFloat, formatInteger, formatMonetary } from "@web/views/fields/formatters";;

import { QuickboardItemBase } from "./quickboard_item_base";

export class QuickboardItemList extends QuickboardItemBase {
    static template = "quickboard.QuickboardItemList";

    setup() {
        super.setup();

        this.gsItemRef = useRef("grid-stack-item");
        this.containerRef = useRef("container");
        this.spinner = new Spin.Spinner(this._getSpinnerOpt());

        this.state = useState({
            "title": "",
            "icon": "",
            "data": "",
            "valueFieldName": "",
            "valueFieldType": "",
            "aggregateFunction": "",

            "dimensionFieldName": "",
            "dimensionFieldType": "",

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
            ).then(() => {
                this.spinner.stop();
            });
        });
    }

    async onMessage(id) {
        if (id == this.itemId) {
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
                this.spinner.stop();
            });
        }
    }

    async loadData(itemId, startDate, endDate) {
        var target = this.gsItemRef.el;
        this.spinner.spin(target);

        const res = await this.quickboard.getQuickboardItem(
            itemId,
            startDate,
            endDate
        );
        this.state.title = res.name;
        this.state.icon = res.icon;
        this.state.data = res.data;
        this.state.valueFieldName = res.value_field_name;
        this.state.valueFieldType = res.value_field_type;
        this.state.dimensionFieldName = res.dimension_field_name;
        this.state.dimensionFieldType = res.dimension_field_type;
        this.state.aggregateFunction = res.aggregate_function;

    }

    formatValue(value){
        let val;
        let val_formatted;

        switch (this.state.valueFieldType){
            case "integer":
                val = parseInteger(String(value));
                val_formatted = formatInteger(val);
                break;
            case "float":
                val = parseFloat(String(value));
                val_formatted = formatFloat(val);
                break;
            case "monetary":
                val = parseMonetary(String(value));
                val_formatted = formatMonetary(val);
                break;
            default:
                if (Number.isSafeInteger(value))
                    val_formatted = formatInteger(value);
                else
                    val_formatted = formatFloat(value);
        }
        return val_formatted
    }
}
