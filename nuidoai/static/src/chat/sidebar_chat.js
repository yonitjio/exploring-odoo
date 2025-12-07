// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState, onWillUnmount } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { AiSidebar } from "@ai_chat_base/webclient/ai_sidebar/ai_sidebar";
export class SidebarChat extends AiSidebar {
    setup() {
        super.setup();
        this.chat = useService("chat");
        this.orm = useService("orm");
        this.company = useService("company");
        this.notification = useService("notification");
        this.action = useService("action");
        this.state = useState({
            isProcessing: false
        });
        // @ts-ignore
        this.bus = this.env.services.bus_service;
        // @ts-ignore
        this.bus.subscribe(this.props.channel, this.aiBotStreamListener.bind(this));
        onWillUnmount(() => {
            // @ts-ignore
            this.bus.unsubscribe(this.props.channel, this.aiBotStreamListener.bind(this));
        });
    }
    aiBotStreamListener({ message, stop }) {
        if (stop) {
            this.state.isProcessing = false;
        }
        else {
            if (this.state.isProcessing) {
                this.update({
                    "text": message
                });
            }
            else {
                console.warn("Received stream while not processing: ", message, stop);
            }
        }
    }
    ;
    update(message) {
        super.update(message);
    }
    get isProcessing() {
        return this.state.isProcessing;
    }
    onBeforeSendMessage() {
        this.state.isProcessing = true;
        return true;
    }
    async isNodeDefinitionSet() {
        const currentCompanyId = this.company.currentCompany.id;
        const nodeDef = await this.orm.searchRead("res.company", [['id', '=', currentCompanyId]], ["node_definition"]);
        const res = nodeDef && nodeDef[0]["node_definition"] ? true : false;
        return res;
    }
    async onSendMessage(message, history) {
        if (await this.isNodeDefinitionSet()) {
            // @ts-ignore
            this.chat.chat(this.props.channel, message.text, history);
            return true;
        }
        else {
            this.notification.add('Chat definition is not set for company.', {
                title: 'Error',
                type: 'danger',
                sticky: false,
            });
            this.state.isProcessing = false;
        }
    }
}
