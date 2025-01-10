import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Domain } from "@web/core/domain";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { useSpecialData, } from "@web/views/fields/relational_utils";
import { getFieldDomain } from "@web/model/relational_model/utils";
import { Component } from "@odoo/owl";

import { parseFloat, parseInteger, parseMonetary } from "@web/views/fields/parsers";
import { formatFloat, formatInteger, formatMonetary } from "@web/views/fields/formatters";;

export class One2ManySummaryField extends Component {
    static template = "exercise_one.One2ManySummaryField";
    static components = { };
    static props = {
        ...standardFieldProps,
        options: { type: Object },
    };

    setup() {
        this.orm = useService("orm");
        this.specialData = useSpecialData((orm, props) => {
            const { relation, relation_field } = props.record.fields[props.name];
            const resId = props.record.resId;
            const domain = getFieldDomain(props.record, props.name);
            const summaryField = props.options.field;
            const summaryMethod = props.options.method;
            const fullField = summaryField + ":" + summaryMethod;

            const fullDomain = Domain.and([domain, [[relation_field, "=", resId]]]);
            return orm.readGroup(relation, fullDomain.toList(), [fullField], [relation_field]);
        });
    }

    // #region format functions
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
    // #endregion

    get value(){
        let val = this.specialData.data[0][this.props.options.field];
        // #region formatting
        switch(this.props.options.format.toLowerCase()){
            case "float":
                val = formatFloat(val);
                break;
            case "integer":
                val = formatInteger(val);
                break;
            case "monetary":
                val = formatMonetary(val);
                break;
        }
        // #endregion

        return val;
    }
}

export const one2ManySummaryField = {
    component: One2ManySummaryField,
    displayName: _t("Summary from One2Many fields"),
    supportedTypes: ["one2many"],
    extractProps: ({ options }) => {
        const props = {
            options: options,
        };
        return props;
    },
};

registry.category("fields").add("one2many_summary", one2ManySummaryField);
