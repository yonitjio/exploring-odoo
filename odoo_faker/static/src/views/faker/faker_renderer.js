/** @odoo-module **/
import { Component, useState, onWillStart } from "@odoo/owl";

export class FakerRenderer extends Component {
    static template = `odoo_faker.FakerRenderer`;
    static props = {
        model: Object,
        archInfo: Object,
        generateRecords: Function,
    }

    setup() {
        this.state = useState({
            recordCount: 0,
            demoCount: 5,
            maxChildCount: 2,
        })

        onWillStart(async () => {
            this.state.recordCount = await this.props.model.loadCount();
        });
    }

    fieldInfo(fieldName){
        const field = this.props.model.config.fields[fieldName];
        const activeField = this.props.model.config.activeFields[fieldName];

        let fieldInfo = {
            name: fieldName,
            type: field["type"],
            module: activeField["module"],
            method: activeField["method"],
            hasChild: activeField.related ? true : false,
        }
        return fieldInfo;
    }

    fieldNames() {
        return Object.keys(this.props.model.config.activeFields).sort();
    }

    childFieldInfo(fieldName, childFieldName){
        const relatedInfo = this.props.model.config.activeFields[fieldName].related;
        const field = relatedInfo.fields[childFieldName];
        const activeField = relatedInfo.activeFields[childFieldName];

        let fieldInfo = {
            name: childFieldName,
            type: field["type"],
            module: activeField["module"],
            method: activeField["method"]
        }
        return fieldInfo;
    }

    childFieldNames(field){
        return Object.keys(this.props.model.config.activeFields[field].related.activeFields).sort();
    }

    async onGenerateButtonClick() {
        await this.props.generateRecords(this.state.demoCount, this.state.maxChildCount);
        this.state.recordCount = await this.props.model.loadCount();
    }
}
