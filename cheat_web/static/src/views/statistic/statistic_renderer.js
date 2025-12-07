import {
    Component
} from "@odoo/owl";

export class StatisticRenderer extends Component {
    static template = `cheat_web.StatisticRenderer`;
    static props = {
        model: Object
    }

    fieldInfo(name){
        return this.props.model.fields[name];
    }

    fieldCount() {
        return Object.keys(this.props.model.fields).length;
    }

    fieldNames() {
        return Object.keys(this.props.model.fields).sort();
    }

    setup() {
        console.log("Statistic Renderer - this: ", this);
    }
}
