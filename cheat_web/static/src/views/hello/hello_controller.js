import { Component } from "@odoo/owl";

import { standardViewProps } from "@web/views/standard_view_props";
import { Layout } from "@web/search/layout";

export class HelloController extends Component {
    static template = `cheat_web.HelloView`;
    static props = {
        ...standardViewProps,
        aValue: { type: String }
    };
    static components = { Layout };

    setup() {
        console.log("Hello Controller - this: ", this);
        console.log("Hello Controller - props: ", this.props);
    }
}
