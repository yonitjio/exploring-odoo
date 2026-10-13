import { registry } from "@web/core/registry";
import { Component, onWillStart, onMounted, onWillPatch, onPatched, onWillUnmount,
    onWillDestroy, onError, signal, proxy
} from "@odoo/owl";

import { Layout } from "@web/search/layout";

class CheatOwl extends Component {
    static template = "cheat_owl";
    static components = { Layout };

    getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    setup() {
        //#region refs
        this.useRefCardTextRef = signal.ref();

        this.domRandomValue1Ref = signal.ref();
        this.domRandomValue2Ref = signal.ref();
        this.domRandomValue3Ref = signal.ref();
        this.domRandomValue4Ref = signal.ref();
        //#endregion

        //#region reactive
        this.randomValue = signal(this.getRandomInteger(0, 100));

        this.state = proxy({
            randomValue: this.getRandomInteger(0, 100),
        });
        //#endregion

        //#region input binding
        this.bindingValue = "";
        this.inputBindingRef = signal.ref();
        //#endregion

        //#region two way input binding
        this.bindingState = proxy({
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

        onMounted(() => {
            console.log("onMounted.");
            this.generateDomRandomValue();
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

        onError((e) => {
            console.log("onError:", e);
        });
        //#endregion
    }

    //#region functions
    generateDomRandomValue() {
        let randomVal = this.getRandomInteger(0, 100);
        this.domRandomValue1Ref().innerText = randomVal;
        this.domRandomValue2Ref().innerText = randomVal;
        this.domRandomValue3Ref().innerText = randomVal;
        this.domRandomValue4Ref().innerText = randomVal;
    }

    generateProxyRandomValue() {
        this.state.randomValue = this.getRandomInteger(0, 100);
    }

    generateSignalRandomValue() {
        this.randomValue.set(this.getRandomInteger(0, 100));
    }

    changeUseRefCardTextColor() {
        this.useRefCardTextRef().classList.toggle("text-danger");
    }

    getInputBindingValue(){
        this.inputBindingRef().innerText = this.bindingValue;
    }

    changeValueStandardInputBinding(){
        this.bindingState.valueStandardInputBinding = "Random value: " + this.getRandomInteger(0, 100);
    }
    //#endregion
}

registry.category("actions").add("cheat_owl", CheatOwl);
