import { Component, proxy, useProps, t, usePlugin } from "@odoo/owl";
import { SimpleText } from "./simple_text";

import { NotificationPlugin } from "@web/core/notifications/notification_plugin";

export class SimpleBox extends Component {
    static template = "cheat_owl_simple_box";
    static components = { SimpleText };

    props = useProps({
        title: t.string()
    });

    setup(){
        this.notification = usePlugin(NotificationPlugin);

        this.state = proxy({
            text: ""
        })
    }

    onChangeText(){
        this.state.text = this.generateRandomString(10);
    }

    onTextClick(){
        this.notification.add('Text click.');
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
