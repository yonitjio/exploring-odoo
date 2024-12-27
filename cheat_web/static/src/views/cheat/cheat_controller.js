import { _t } from "@web/core/l10n/translation";

import { Component, useState, useRef, onWillPatch } from "@odoo/owl";

import { Layout } from "@web/search/layout";
import { usePager } from "@web/search/pager_hook";
import { useSearchBarToggler } from "@web/search/search_bar/search_bar_toggler";
import { SearchBar } from "@web/search/search_bar/search_bar";

import { useModel } from "@web/model/model";
import { extractFieldsFromArchInfo } from "@web/model/relational_model/utils";

import { standardViewProps } from "@web/views/standard_view_props";
import { executeButtonCallback } from "@web/views/view_button/view_button_hook";

export class CheatController extends Component {
    static template = `cheat_web.CheatView`;
    static props = {
        ...standardViewProps,
        offset: { type: Number, optional: true },
        Model: Function,
        Renderer: Function,
        archInfo: Object,
    }
    static components = {
        Layout,
        SearchBar
    };

    setup() {
        console.log("Statistic Controller - this: ", this);
        console.log("Statistic Controller - props: ", this.props);

        this.rootRef = useRef("root");

        this.props.offset = 0;
        this.model = useState(useModel(this.props.Model, this.modelParams));

        usePager(() => {
            return {
                offset: this.model.offset,
                limit: this.model.limit,
                total: this.model.recordsLength,
                onUpdate: async ({ offset, limit }) => {
                    this.props.offset = offset;
                    this.props.limit = limit;
                    await this.model.load(this.props);
                },
            };
        });

        this.searchBarToggler = useSearchBarToggler();

        this.firstLoad = true;
        onWillPatch(() => {
            this.firstLoad = false;
        });
    }

    get modelParams() {
        const { activeFields, fields } = extractFieldsFromArchInfo(
            this.props.archInfo,
            this.props.fields
        );

        for (let [key, value] of Object.entries(activeFields)) {
            let fieldNode = this.props.archInfo.fieldNodes[key];
            value.conserveLineBreaks = fieldNode.conserveLineBreaks;
        }

        return {
            resModel: this.props.resModel,
            fields,
            activeFields,
        };
    }

    get rendererProps() {
        return {
            model: this.model,
            records: this.model.records,
            activeFields: this.model.config.activeFields,
            editRecord: this.onClickEdit.bind(this),
        };
    }

    get className() {
        return this.props.className;
    }

    async onClickCreate() {
        return executeButtonCallback(this.rootRef.el, () => this.props.createRecord());
    }

    async onClickEdit(ev, record) {
        return executeButtonCallback(this.rootRef.el, () => this.props.selectRecord(record.id, true));
    }
}
