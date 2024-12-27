import { Component, useState, useRef, onWillStart } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

import { standardViewProps } from "@web/views/standard_view_props";
import { Layout } from "@web/search/layout";

export class StatisticController extends Component {
    static template = `cheat_web.StatisticView`;
    static props = {
        ...standardViewProps,
        Model: Function,
        Renderer: Function,
    };
    static components = { Layout };

    setup() {
        console.log("Statistic Controller - this: ", this);
        console.log("Statistic Controller - props: ", this.props);

        this.orm = useService("orm");

        this.model = new this.props.Model(
                this.orm,
                this.props.resModel,
                this.props.fields
            );

        onWillStart(async () => {
            await this.model.load(this.props);
        });
    }
}
