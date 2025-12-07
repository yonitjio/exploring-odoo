// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState, onWillUnmount } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { user } from "@web/core/user";
import { AiSidebar } from "@ai_chat_base/webclient/ai_sidebar/ai_sidebar";
export class NuidoFlowSidebarChat extends AiSidebar {
    setup() {
        super.setup();
        this.chat = useService("nuido_flow_ai_chat");
        this.orm = useService("orm");
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
                this.update(message);
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
    reset() {
        this.chat.chatReset();
        super.reset();
    }
    get isProcessing() {
        return this.state.isProcessing;
    }
    onBeforeSendMessage() {
        this.state.isProcessing = true;
        return true;
    }
    async isNodeDefinitionSet() {
        let res = false;
        try {
            const nodeDef = await this.orm.searchRead("res.users", [['id', '=', user.userId]], ["nuido_flow_ai_chat_node_definition_id"]);
            res = nodeDef && nodeDef[0]["nuido_flow_ai_chat_node_definition_id"] ? true : false;
        }
        catch {
            console.error("Failed to retrieve AI chat node definition for user.");
        }
        return res;
    }
    async onSendMessage(message, history) {
        if (await this.isNodeDefinitionSet()) {
            // @ts-ignore
            this.chat.chat(this.props.channel, message);
            return true;
        }
        else {
            this.notification.add('Chat definition is not set for user.', {
                title: 'Error',
                type: 'danger',
                sticky: false,
            });
            this.state.isProcessing = false;
        }
    }
}
