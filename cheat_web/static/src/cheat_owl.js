/** @odoo-module */

import { registry } from "@web/core/registry";
import {
    Component,
    onWillStart,
    onWillRender,
    onRendered,
    onMounted,
    onWillUpdateProps,
    onWillPatch,
    onPatched,
    onWillUnmount,
    onWillDestroy,
    onError,
    useState,
    useRef
} from "@odoo/owl";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";
import { Layout } from "@web/search/layout";

class CheatOwl extends Component {
    static template = "cheat_owl";
    static components = { Layout };
    static props = {
        ...standardActionServiceProps,
    };

    getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    setup() {
        this.useRefCardTextRef = useRef("useRefCardText");

        //#region non reactive
        this.nonReactiveRandomValue = this.getRandomInteger(0, 100);
        this.nonReactiveRandomValue1Ref = useRef("nonReactiveRandomValue1");
        this.nonReactiveRandomValue2Ref = useRef("nonReactiveRandomValue2");
        this.nonReactiveRandomValue3Ref = useRef("nonReactiveRandomValue3");
        this.nonReactiveRandomValue4Ref = useRef("nonReactiveRandomValue4");
        //#endregion

        //#region reactive
        this.state = useState({
            randomValue: this.getRandomInteger(0, 100),
        });
        //#endregion

        //#region input binding
        this.bindingValue = "";
        this.inputBindingRef = useRef("inputBinding");
        //#endregion

        //#region two way input binding
        this.bindingState = useState({
            valueStandardInputBinding: "",
            valueTextAreaInputBinding: "",
            valueCheckBoxInputBinding: false,
            valueRadioButtonInputBinding: "",
            valueSelectionInputBinding: "",
            valueRangeInputBinding: 0,
        });
        //#endregion

        //#region owl lifecycle
        onWillStart(() => {
            console.log("onWIllStart.");
        });

        onWillRender(() => {
            console.log("onWillRender.");
        });

        onRendered(() => {
            console.log("onRendered.");
        });

        onMounted(() => {
            console.log("onMounted.");
        });

        onWillUpdateProps((nextProps) => {
            console.log("onWillUpdateProps:", nextProps);
        });

        onWillPatch(() => {
            console.log("onWillPatch.");
        });

        onPatched(() => {
            console.log("onPatched.");
        });

        onWillUnmount(() => {
            console.log("onWillUnmount.");
        });

        onWillDestroy(() => {
            console.log("onWillDestroy.");
        });

        onError(() => {
            console.log("onError.");
        });
        //#endregion
    }

    //#region functions
    generateNonReactiveRandomValue() {
        let randomVal = this.getRandomInteger(0, 100);
        this.nonReactiveRandomValue1Ref.el.innerText = randomVal;
        this.nonReactiveRandomValue2Ref.el.innerText = randomVal;
        this.nonReactiveRandomValue3Ref.el.innerText = randomVal;
        this.nonReactiveRandomValue4Ref.el.innerText = randomVal;
    }

    generateRandomValue() {
        this.state.randomValue = this.getRandomInteger(0, 100);
    }

    changeUseRefCardTextColor() {
        this.useRefCardTextRef.el.classList.toggle("text-danger");
    }

    getInputBindingValue(){
        this.inputBindingRef.el.innerText = this.bindingValue;
    }

    changeValueStandardInputBinding(){
        this.bindingState.valueStandardInputBinding = "Random value: " + this.getRandomInteger(0, 100);
    }
    //#endregion
}

registry.category("actions").add("cheatowl", CheatOwl);
