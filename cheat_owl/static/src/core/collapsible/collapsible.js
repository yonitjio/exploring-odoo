import { Component, useProps, t } from "@odoo/owl";

export class Collapsible extends Component {
    static template = "collapsible";

    props = useProps({
        name: t.string(),
        title: t.string(),
        slots: t.object().optional(),
        collapsed: t.boolean().optional(true)
    });
}
