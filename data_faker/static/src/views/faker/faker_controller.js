/*!
 * © 2025 Yoni
 * This software is experimental and provided "as-is".
 * No guarantees, warranties, or liability are assumed.
 * See the LICENSE file included with this software for full details.
 */

import { Component, useState, useRef, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { Layout } from "@web/search/layout";
import { useModel } from "@web/model/model";
import { extractFieldsFromArchInfo } from "@web/model/relational_model/utils";
import { standardViewProps } from "@web/views/standard_view_props";
import { executeButtonCallback } from "@web/views/view_button/view_button_hook";

export class FakerController extends Component {
    static template = `odoo_faker.FakerView`;
    static props = {
        ...standardViewProps,
        offset: { type: Number, optional: true },
        Model: Function,
        Renderer: Function,
        archInfo: Object,
    }
    static components = { Layout };

    setup() {
        this.rootRef = useRef("root");
        this.ui = useService("ui");

        this.recordAction = this.props.archInfo.recordAction;
        this.recordActionMode = this.props.archInfo.recordActionMode;
        this.recordMaxCount =  this.props.archInfo.recordMaxCount;

        this.props.domain = [["id", "=", "0"]]
        this.model = useState(useModel(this.props.Model, this.modelParams));

        onWillStart(async () => {
            const { faker } = await import("/data_faker/static/lib/faker.js");
            this.model.faker = faker;
        })
    }

    _extractFakerValues(obj){
        const res = {};
        res.module = obj.module ? obj.module : "";
        res.method = obj.method ? obj.method : "";
        res.params = obj.params ? obj.params : "";
        res.values = obj.values ? obj.values : "";
        res.businessHours = obj.businessHours ? obj.businessHours : false;
        res.dep = obj.dep ? obj.dep : "";
        res.link = obj.link ? obj.link : "";
        res.domain = obj.domain ? obj.domain : "";
        return res;
    }

    _prepActiveField(key, activeField, fields, fieldNodes){
        const fieldNode = fieldNodes[key];
        activeField.type = fieldNode.type;

        const fakerValues = this._extractFakerValues(fieldNode);
        Object.assign(activeField, fakerValues);

        if (activeField.type === "one2many"){
            activeField.relation = fields[key].relation;

            if (activeField.related){
                if (fieldNode.views){
                    const childFakerView = fieldNode.views["faker"];
                    if (childFakerView) {
                        const childActiveFields = activeField.related.activeFields;
                        const childFields = activeField.related.fields;
                        const childFieldNodes = childFakerView.fieldNodes;
                        for (const [childKey, childValue] of Object.entries(childActiveFields)) {
                            this._prepActiveField(childKey, childValue, childFields, childFieldNodes);
                        }
                    }
                }
            }
        } else if (["many2one", "many2many"].includes(activeField.type)){
            activeField.relation = fields[key].relation;
        }
    }

    _prepareModelParams(){
        const { archInfo, resModel } = this.props;
        const { activeFields, fields } = extractFieldsFromArchInfo(archInfo, this.props.fields);
        const fieldNodes = this.props.archInfo.fieldNodes;

        for (const [key, value] of Object.entries(activeFields)) {
            this._prepActiveField(key, value, fields, fieldNodes);
        }

        return { resModel, activeFields, fields }
    }

    get modelParams() {
        const { resModel, activeFields, fields } = this._prepareModelParams();

        return {
            config: {
                activeFields,
                resModel,
                fields,
            },
        };
    }

    get rendererProps() {
        return {
            model: this.model,
            archInfo: this.props.archInfo,
            generateRecords: this.onClickGenerate.bind(this),
        };
    }

    async onClickGenerate(count, maxChildCount) {
        return executeButtonCallback(this.rootRef.el, async () => {
            this.ui.block();
            try {
                await this.model.generateDemoData(count, maxChildCount, this.recordAction, this.recordActionMode);
            } finally{
                this.ui.unblock();
            }
        });
    }
}
