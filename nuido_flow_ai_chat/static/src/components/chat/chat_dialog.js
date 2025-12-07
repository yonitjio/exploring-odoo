// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
/** @odoo-module **/
import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { Dialog } from "@web/core/dialog/dialog";
import { AiChatContainer } from "@ai_chat_base/webclient/ai_chat/ai_chat_container";
export class ChatDialog extends AiChatContainer {
    setup() {
        super.setup();
        this.chat = useService("nuido_flow_ai_chat");
        this.notification = useService("notification");
        this.state = useState({
            isProcessing: false
        });
        const onAiMessage = ({ message, stop }) => {
            if (stop) {
                this.state.isProcessing = false;
            }
            else {
                if (this.isProcessing) {
                    this.update(message);
                }
                else {
                    console.warn("Received stream while not processing: ", message, stop);
                }
            }
        };
        // @ts-ignore
        this.busService = this.env.services.bus_service;
        // @ts-ignore
        this.busService.subscribe(this.props.channel, onAiMessage.bind(this));
    }
    update(message) {
        super.update(message);
    }
    reset() {
        // @ts-ignore
        this.chat.testChatReset(this.props.nodeDefId);
        super.reset();
    }
    get isProcessing() {
        return this.state.isProcessing;
    }
    onBeforeSendMessage() {
        this.state.isProcessing = true;
        return true;
    }
    onSendMessage(message, history) {
        // @ts-ignore
        const res = this.chat.testChat(this.props.nodeDefId, this.props.channel, message);
        if (!res) {
            this.notification.add('Failed to process message.', {
                title: 'Error',
                type: 'danger',
                sticky: false,
            });
        }
        return res;
    }
}
ChatDialog.template = "nuido_flow_ai_chat.chat-dialog";
ChatDialog.components = {
    ...AiChatContainer.components,
    Dialog,
};
ChatDialog.props = {
    ...AiChatContainer.props,
    nodeDefId: Number,
    close: { type: Function }
};
