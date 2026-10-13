import { Component, proxy, usePlugin } from "@odoo/owl";
import { CheatBusPlugin } from "../plugins/bus_plugin";
import { useBus } from "@web/core/utils/hooks";

export class BusBoxB extends Component {
    static template = "cheat_owl_bus_box_b";

    setup(){
        this.state = proxy({
            text: ""
        })

        this.bus = usePlugin(CheatBusPlugin);

        useBus(this.bus.bus, "bus_box",
            this.onEventTriggered.bind(this));
    }

    onEventTriggered(ev){
        this.state.text = ev.detail.message;
    }
}
