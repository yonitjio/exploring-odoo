/** @odoo-module **/
import { Component } from "@odoo/owl";
import { QuickboardItemBasic } from "./quickboard_item_basic";
import { QuickboardItemChart } from "./quickboard_item_chart";
import { QuickboardItemList } from "./quickboard_item_list";
import { standardQuickboardItemProps } from "./standard_quickboard_item_props"

export class QuickboardItem extends Component {
    static template = "quickboard.QuickboardItem"
    static props = {
        ...standardQuickboardItemProps,
        itemType: { type: String },
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
            "action": this.props.action,
            "itemId": this.props.itemId,
            "theme": this.props.theme,
            "startDate": this.props.startDate,
            "endDate": this.props.endDate
        }
    }
}
