import { registry } from "@web/core/registry";
import { Component, providePlugins } from "@odoo/owl";

import { Layout } from "@web/search/layout";
import { SimpleBox } from "./components/simple_box";
import { BusBoxA } from "./components/bus_box_a";
import { BusBoxB } from "./components/bus_box_b";
import { ImperativeBox } from "./components/imperative_box";
import { CheatBusPlugin } from "./plugins/bus_plugin";

class CheatOwlCompInteraction extends Component {
    static template = "cheat_owl_comp_interaction";
    static components = { Layout, SimpleBox, BusBoxA, BusBoxB, ImperativeBox };

    setup(){
        providePlugins([CheatBusPlugin])
    }
}

registry.category("actions").add("cheat_owl_comp_interaction", CheatOwlCompInteraction);
