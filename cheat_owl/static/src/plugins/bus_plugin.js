import { EventBus, Plugin } from "@odoo/owl";

export class CheatBusPlugin extends Plugin {
    bus = new EventBus();

    setup(){
        this.id = crypto.randomUUID()
    }
}
