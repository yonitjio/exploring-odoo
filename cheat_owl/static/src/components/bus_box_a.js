import { Component, usePlugin } from "@odoo/owl";
import { CheatBusPlugin } from "../plugins/bus_plugin";

export class BusBoxA extends Component {
    static template = "cheat_owl_bus_box_a";

    setup() {
        this.bus = usePlugin(CheatBusPlugin);
    }

    onTriggerEvent(){
        this.bus.bus.trigger("bus_box", {
            message: this.generateRandomString(10)
        });
    }

    generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}
