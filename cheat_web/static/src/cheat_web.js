/** @odoo-module */

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, useState, xml } from "@odoo/owl";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";
import { Layout } from "@web/search/layout";
import { AlertDialog, ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { Dialog } from "@web/core/dialog/dialog";

import { rpc } from "@web/core/network/rpc";
import { user } from "@web/core/user";
import { url } from "@web/core/utils/urls";

const { DateTime } = luxon;

//#region custom dialog
class MyDialog extends Component {
    static components = { Dialog };
    static template = xml`
        <Dialog size="'md'" title="'This is my dialog title'">
            <p>
            This is my dialog content.
            </p>
        </Dialog>
    `;
}

class MyDialogWithButtons extends Component {
    static components = { Dialog };
    static template = xml`
        <Dialog size="'md'" title="'This is my dialog with buttons'">
            <p>
            This is my dialog with buttons content.
            </p>
            <t t-set-slot="footer">
                <button class="btn btn-primary" t-on-click="onConfirm">Ok</button>
                <button class="btn btn-secondary" t-on-click="onCancel">Cancel</button>
            </t>
        </Dialog>
    `;

    setup() {
        this.notification = useService("notification");
    }

    onConfirm() {
        this.notification.add('You confirmed the dialog.');
        this.props.close();
    }

    onCancel() {
        this.notification.add('You canceled the dialog.');
        this.props.close();
    }
}
//#endregion

class CheatWeb extends Component {
    //#region statics
    static template = "cheat_web";
    static components = { Layout };
    static props = {
        ...standardActionServiceProps,
    };
    //#endregion

    setup() {
        //#region services
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.dialog = useService("dialog");
        //#endregion

        this.user = user;
        this.state = useState({
            userCharValue: user.settings.cheat_web_user_setting_char_field,
            userIntegerValue: user.settings.cheat_web_user_setting_integer_field
        });
    }

    //#region user
    get userImage(){
        return url("/web/image", {
            model: 'res.users',
            id: user.userId,
            field: "avatar_128",
         });
    }

    async dumpUserSettings(){
        console.log("User:", user);
        console.log("User settings:", user.settings);
    }

    async dumpState(){
        console.log("state:", this.state);
    }

    async saveUserSettings(){
        await user.setUserSettings(
            "cheat_web_user_setting_char_field",
            this.state.userCharValue
        );
        await user.setUserSettings(
            "cheat_web_user_setting_integer_field",
            this.state.userIntegerValue
        );
    }
    //#endregion

    //#region misc function
    getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }
    //#endregion

    //#region rpc
    async rpcDoSomething() {
        const res = await rpc("/cheat/webrpc");
        console.log(res);
    }

    async rpcDoSomethingElse() {
        const res = await rpc("/cheat/webrpcwithparam", { param1: 1, param2: "2"});
        console.log(res);
    }

    async rpcDoSomethingWithRouteParam() {
        const param1 = 3;
        const param2 = 4;
        const res = await rpc(`/cheat/webrpc/${param1}/${param2}`);
        console.log(res);
    }
    //#endregion

    //#region orm
    async ormCreate() {
        const res = await this.orm.create("cheat.web", [
            {
                char_field: "Char Field #" + DateTime.now().toUnixInteger(),
                int_field: this.getRandomInteger(1, 1000)
            },
            {
                char_field: "Char Field #" + DateTime.now().toUnixInteger(),
                int_field: this.getRandomInteger(1, 1000)
            },
        ]);
        console.log(res);
    }

    async ormSearch() {
        const res = await this.orm.search("cheat.web", [['id', '>=', 0]], { order: "id desc", limit: 1, offset: 0 });
        console.log(res);
    }

    async ormSearchCount() {
        const res = await this.orm.searchCount("cheat.web", [['id', '>=', 0]]);
        console.log(res);
    }

    async ormSearchRead() {
        const res = await this.orm.searchRead("cheat.web", [['id', '>=', 0]], ["char_field", "int_field"]);
        console.log(res);
    }

    async ormRead() {
        const ids = await this.orm.search("cheat.web", [['id', '>=', 0]]);
        if (ids.length > 0){
            const res = await this.orm.read("cheat.web", [ids[0]], ["char_field"]);
            console.log(res);
        }
    }

    async ormWrite() {
        const ids = await this.orm.search("cheat.web", [['id', '>=', 0]]);
        if (ids.length > 0) {
            let res = await this.orm.read("cheat.web", [ids[0]], ["char_field"]);
            console.log('Old Values:', res);
            await this.orm.write('cheat.web', [ids[0]],
                {
                    'char_field': `Updated #${DateTime.now().toUnixInteger()}`
                }
            );
            res = await this.orm.read("cheat.web", [ids[0]], ["char_field"]);
            console.log('New Values:', res);
        }
    }

    async ormUnlink() {
        let ids = await this.orm.search("cheat.web", [['id', '>=', 0]], { order: "id desc" });
        if (ids.length > 0) {
            console.log('Search Result:', ids);
            await this.orm.unlink('cheat.web', [ids[0]]);
            ids = await this.orm.search("cheat.web", [['id', '>=', 0]], { order: "id desc" });
            console.log('Search Result:', ids);
        }
    }

    async ormDoSomething() {
        const res = await this.orm.call("cheat.web", "do_something", [1]);
        console.log(res);
    }

    async ormDoSomethingElse() {
        const res = await this.orm.call("cheat.web", "do_something_else", [1], { param1: '1', param2: "2"});
        console.log(res);
    }

    async ormDoModelMethod() {
        const res = await this.orm.call("cheat.web", "do_model_method", [], { param1: "3", param2: "4" });
        console.log(res);
    }
    //#endregion

    //#region notification
    async notifSimple(){
        this.notification.add('This is a simple Notification');
    }

    async notifSticky(){
        this.notification.add('This is a sticky Notification', {
            title: 'Sticky Notification',
            type: 'success',
            sticky: true,
        });
    }

    async notifCallback(){
        this.notification.add('This is a Notification with onClose callback', {
            title: 'Sticky Notification',
            type: 'info',
            sticky: true,
            onClose: () => {
                this.notification.add('This is from onclose callback.');
            }
        });
    }

    async notifWithButtons(){
        this.notification.add('This is a Notification with Buttons', {
            title: 'Sticky Notification',
            type: 'warning',
            sticky: true,
            buttons: [
                {
                    name: 'Button 1',
                    onClick: () => {
                        this.notification.add('This is from button 1 onclick.');
                    }
                },
                {
                    name: 'Button 2',
                    onClick: () => {
                        this.notification.add('This is from button 2 onclick.');
                    }
                }
            ]
        });
    }
    //#endregion

    //#region dialog
    async dialogAlert(){
        this.dialog.add(AlertDialog, {
            title: 'This is an Alert Dialog',
            body: 'This is the alert message.',
            contentClass: 'text-danger'
        });
    }

    async dialogConfirm(){
        this.dialog.add(ConfirmationDialog, {
            title: 'This is an Confirmation Dialog',
            body: 'This is the dialog message.',
            confirmLabel: 'Click here to confirm.',
            cancelLabel: "Click here to cancel.",
            cancel: async () => {
                this.notification.add('You canceled the dialog.');
            },
            confirm: async () => {
                this.notification.add('You confirmed the dialog.');
            },
        });
    }

    async dialogCustom(){
        this.dialog.add(MyDialog);
    }

    async dialogCustomWithButtons(){
        this.dialog.add(MyDialogWithButtons);
    }
    //#endregion

}

registry.category("actions").add("cheatweb", CheatWeb);
