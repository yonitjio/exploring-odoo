import { registry } from "@web/core/registry";
import { HelloController } from "./hello_controller";

export const helloView = {
    type: "hello",
    Controller: HelloController,

    props(genericProps, view) {
        console.log("Hello View - this: ", this);
        console.log("Hello View - genericProps: ", genericProps);
        console.log("Hello View - view: ", view);

        return {
            ...genericProps,
            aValue: 'A value from view type.'
        };
    },
};

registry.category("views").add("hello", helloView);
