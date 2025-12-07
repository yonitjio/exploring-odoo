/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { AiChatContainer } from "@ai_chat_base/webclient/ai_chat/ai_chat_container";
export class ChatCorner extends AiChatContainer {
    static template = "nuido_flow_ai_website_chat.ChatCorner";
    static props = {
        ...AiChatContainer.props,
        close: Function
    };
    ui;
    chat;
    state;
    bus;
    setup() {
        super.setup();
        this.ui = useService("ui");
        this.chat = useService("nuido_flow_ai_website_chat");
        this.state = useState({
            isProcessing: false
        });
        const aiBotStreamListener = ({ message, stop }) => {
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
        };
        this.bus = this.env.services.bus_service;
        this.bus.subscribe(this.props.channel, aiBotStreamListener.bind(this));
    }
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
    onSendMessage(message, history) {
        const response = this.chat.chat(this.props.channel, message, {});
        return response;
    }
    close() {
        this.props.close();
    }
    get cardStyle() {
        return "background-color: var(--body-bg)";
    }
    get style() {
        if (this.ui.isSmall) {
            return "width: 100%; right:0; left: 0; top:0; bottom:0;";
        }
        else {
            return "width: 500px; height: 800px; max-height:90vh; right:10px; bottom:10px;";
        }
    }
}
