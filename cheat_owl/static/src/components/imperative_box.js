import { Component } from "@odoo/owl";
import { ImperativeText } from "./imperative_text";

export class ImperativeBox extends Component {
    static template = "cheat_owl_imperative_box";
    static components = { ImperativeText }

    setup(){
        this.imperativeTextHandle = {
            current: null
        };
    }
    
    onCallSubComponentMethod(){
        this.imperativeTextHandle.current.setText(
            this.generateRandomString(10)
        );
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
