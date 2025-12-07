import { onMounted, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

import { AiChatContainer } from "@ai_chat_base/webclient/ai_chat/ai_chat_container";

export class AiCorner extends AiChatContainer {
    static template = "ai_portal_chat.AiCorner"
    static props = {
        ...AiChatContainer.props,
        close: Function
    }

    setup() {
        super.setup();

        this.ui = useService("ui");
        this.aiChatService = useService("ai_chat");

        this.state = useState({
            isStreamingMode: true,
            isProcessing: false
        })

        const aiBotStreamListener = ({ message, stop }) => {
            console.log("STREAM:", message, stop);
            if (stop) {
                this.state.isProcessing = false;
            } else {
                if (this.state.isProcessing) {
                    this.update(message);
                } else {
                    console.warn(
                        "Received stream while not processing: ",
                        message,
                        stop
                    );
                }
            }
        };
        this.busService = this.env.services.bus_service;
        this.busService.subscribe(this.props.channel, aiBotStreamListener.bind(this));

        onMounted(() => {
            this.reset();
        })
    }

    get isProcessing() {
        return this.state.isProcessing;
    }

    onBeforeSendMessage(){
        this.state.isProcessing = true;
        return true;
    }

    _buildContext(){
        return {
            base_url: window.location.origin,
            path: window.location.pathname,
            content: document.documentElement.outerHTML
        };
    }

    async onSendMessage(message, history){
        if (this.state.isStreamingMode){
            this.aiChatService.chat(this.props.channel, message, history,
                {
                    context: this._buildContext(),
                    streaming: true
                }
            );
            return true;
        } else {
            const response = await this.aiChatService.chat(this.props.channel, message, history,
                {
                    context: this._buildContext(),
                    streaming: false
                }
            );
            this.update(response);
            this.state.isProcessing = false;
            return true;
        }
    }

    toggleStreamingMode(){
        this.state.isStreamingMode = !this.state.isStreamingMode;
        this.reset()
    }

    get isStreamingMode(){
        return this.state.isStreamingMode;
    }

    close(){
        this.props.close();
    }

    get cardStyle() {
        return "background-color: var(--body-bg)"
    }

    get style(){
        if (this.ui.isSmall){
            return "width: 100%; right:0; left: 0; top:0; bottom:0;"
        } else {
            return "width: 500px; height: 800px; max-height:90vh; right:10px; bottom:10px;"
        }
    }
}
