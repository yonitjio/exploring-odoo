import { Component, proxy, useProps, t, useEffect } from "@odoo/owl";

export class ImperativeText extends Component {
    static template = "cheat_owl_imperative_text";
    
    props = useProps({
        handle: t.object()
    });

    setup(){
        this.state = proxy({
            text: ""
        })

        useEffect(() => {
            this.props.handle.current = {
                setText: (value) => this.setText(value)
            };

            return () => {
                this.props.handle.current = null;
            };
        })
    }

    setText(text){
        this.state.text = text;
    }
}
