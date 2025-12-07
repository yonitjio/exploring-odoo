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
        this.chat = useService("chat");
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
        // @ts-ignore
        this.props.bus.trigger(this.props.channel + "/message", { message: {
                text: message,
                attachments: []
            } });
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
        this.chat.testChat(this.props.agentDefId, this.props.channel, message.text, history);
        return true;
    }
}
ChatDialog.template = "nuidoai.chat-dialog";
ChatDialog.components = {
    ...AiChatContainer.components,
    Dialog
};
ChatDialog.props = {
    ...AiChatContainer.props,
    agentDefId: Number,
    close: { type: Function }
};
