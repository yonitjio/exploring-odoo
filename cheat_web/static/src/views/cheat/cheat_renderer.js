import { Component, useRef } from "@odoo/owl";
import { executeButtonCallback } from "@web/views/view_button/view_button_hook";

export class CheatRenderer extends Component {
    static template = `cheat_web.CheatRenderer`;
    static props = {
        model: Object,
        records: Object,
        activeFields: Object,
        editRecord: Function
    }

    setup() {
        console.log("Cheat Renderer - this: ", this);
        this.rootRef = useRef("renderer_root");
    }

    getInputId(record, field){
        return  record.id + '_' + field
    }

    getFirstFiveFields(){
        const fields = Object.keys(this.props.activeFields).filter(o => o !== "display_name" & o !== "id") .sort().slice(0, 4);
        return fields;
    }

    getLabel(field){
        const config = this.props.model.config;
        return config.fields[field].string;
    }

    getFieldValue(record, field){
        return record[field];
    }

    getConserveLineBreakSetting(field){
        return this.props.activeFields[field].conserveLineBreaks;
    }

    onEditButtonClick(ev, record) {
        this.props.editRecord(ev, record);
    }
}
