import { Component, useProps, t } from "@odoo/owl";

export class SimpleText extends Component {
    static template = "cheat_owl_simple_text";

    props = useProps({
        text: t.string(),
        onClick: t.function()
    });
}
