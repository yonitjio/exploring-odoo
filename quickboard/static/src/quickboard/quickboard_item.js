/** @odoo-module **/
import { Component } from "@odoo/owl";
import { QuickboardItemBasic } from "./quickboard_item_basic";
import { QuickboardItemChart } from "./quickboard_item_chart";
import { QuickboardItemList } from "./quickboard_item_list";

export class QuickboardItem extends Component {
    static template = "quickboard.QuickboardItem"

    setup() {
        this.dialog = this.props.dialogService;
        this.action = this.props.actionService;
    }

    get _itemComponent(){
        if (this.props.itemType === "basic"){
            return QuickboardItemBasic;
        } else if (this.props.itemType === "chart"){
            return QuickboardItemChart
        } else if (this.props.itemType === "list"){
            return QuickboardItemList
        }

        return Component;
    }

    get _itemProps(){
        return {
            "itemId": this.props.itemId,
            "dialogService": this.props.dialogService,
            "actionService": this.props.actionService,
            "startDate": this.props.startDate,
            "endDate": this.props.endDate
        }
    }
}
