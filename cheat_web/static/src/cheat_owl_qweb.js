/** @odoo-module */
import { registry } from "@web/core/registry";
import { Component, useState, markup } from "@odoo/owl";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";
import { Layout } from "@web/search/layout";
import { HAccordion } from "./core/haccordion/haccordion";
import { Collapsible } from "./core/collapsible/collapsible";

import { CheatOwlQwebInlineTemplate } from "./cheat_owl_qweb_inline_template"

class CheatOwlQweb extends Component {
    static template = "cheat_owl_qweb";
    static components = { Layout, CheatOwlQwebInlineTemplate, HAccordion, Collapsible };
    static props = {
        ...standardActionServiceProps,
    };

    //#region Misc Functions
    getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    get randomString() {
        var letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var llen = letters.length;
        var res = "";
        for (var i = 0; i < 6; i++) {
            res += letters[Math.floor(Math.random() * llen)];
        }
        return res;
    }

    get randomBoolean() {
        return Math.round(Math.random()) == 1;
    }

    get dynamicTemplate() {
        if (this.state.dynamicTemplate === "one") {
            return "cheat_owl_qweb_sub_template_one"
        } else if (this.state.dynamicTemplate === "two"){
            return "cheat_owl_qweb_sub_template_two"
        } else if (this.state.dynamicTemplate === "three"){
            return "cheat_owl_qweb_sub_template_three"
        } else {
            return "cheat_owl_qweb_sub_template_four"
        }
    }
    //#endregion

    setup() {
        this.state = useState({
            randomValue: this.getRandomInteger(0, 100),
            checkBoxValue: "one",
            dynamicTag: "div",
            dynamicTemplate: "one"
        });

        this.markup = markup;
        this.divText = "<div>some text 1</div>";
        this.markupDivText = markup("<div>some text 2</div>");
        this.arrayOfObjects = [
            {
                id: 1,
                name: "Item No. 1",
            },
            {
                id: 2,
                name: "Item No. 2",
            },
            {
                id: 3,
                name: "Item No. 3",
            },
        ];
        this.aSetOfObjects = new Set(this.arrayOfObjects);
    }
}

registry.category("actions").add("cheat_owl_qweb", CheatOwlQweb);
