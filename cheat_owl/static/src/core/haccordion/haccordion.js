import { Component, proxy, useProps, t } from "@odoo/owl";

export class HAccordion extends Component {
    static template = "haccordion";

    props = useProps({
        name: t.string(),
        startItem: t.number().optional(0),
        slots: t.object().optional(),
    });

    setup() {
        this.state = proxy({ activeItem: this.props.startItem });
        this.itemNames = Object.keys(this.props.slots);
    }

    onClick(item) {
        this.state.activeItem = item;
    }
}
