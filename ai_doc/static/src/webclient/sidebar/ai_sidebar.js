/** @odoo-module **/
import { Component, useState, useRef, onMounted, onWillUnmount } from "@odoo/owl";

import { registry } from "@web/core/registry";
import { cookie } from "@web/core/browser/cookie";
import { useService } from "@web/core/utils/hooks";
import { user } from "@web/core/user";
import { imageUrl } from "@web/core/utils/urls";
import { useMouseListeners } from "../../core/utils";

export class AiDocSidebar extends Component {
    static template = "ai_doc.AiDocSidebar";
    static props = {}

    setup() {
        super.setup();

        this.containerRef = useRef("container");
        this.chatUiRef = useRef("chat-ui");
        this.handleRef = useRef("handle");
        this.aiChatService = useService("ai_doc");

        this.state = useState({
            width: "600px",
            isResizing: false,
            isStreamingMode: true,
        });

        onMounted (() => {
            this.createAiChat();
        });

        const aiBotStreamListener = ({ message, stop }) => {
            if (stop && this.onStop){
                this.onStop();
            } else if ((!stop) && this.onMessage) {
                this.onMessage(message);
            }
        }
        this.busService = this.env.services.bus_service;
        this.busService.subscribe("ai_doc_stream", aiBotStreamListener);

        onWillUnmount(() => {
            this.busService.unsubscribe("ai_doc_stream", aiBotStreamListener);
        });

        // #region Mouse Events
        this.onHandleMouseDown = useMouseListeners({
            onMouseDown: this.onMouseDown,
            onMouseMove: this.onMouseMove,
            onMouseUp: this.onMouseUp,
        });
        // #endregion
    }

    createAiChat() {
        if (this.aiChat){
            this.aiChat.unmount();
            delete this.aiChat;
        }

        const adapter = this.state.isStreamingMode ? {
            streamText: this.streamText.bind(this),
        } : {
            batchText: this.batchText.bind(this)
        }

        const { partnerId, writeDate } = user;
        const userAvatar = imageUrl("res.partner", partnerId, "avatar_256", { unique: writeDate });

        const theme = cookie.get("color_scheme");

        this.aiChat = globalThis["@nlux/core"].createAiChat()
            .withAdapter(adapter)
            .withDisplayOptions({
                colorScheme: theme
            })
            .withConversationOptions({
                historyPayloadSize: 'max',
                conversationStarters: [],
            })
            .withComposerOptions({
                placeholder: 'How can I help you today?',
                autoFocus: true,
            })
            .withPersonaOptions({
                assistant: {
                    name: 'AI Doc',
                    avatar: '/ai_doc/static/images/ai-chatbot.png',
                    tagline: 'Your Smart Odoo Documentation Bot!'
                },
                user: {
                    name: user.name,
                    avatar: userAvatar
                }
            })
            .withMessageOptions({
                waitTimeBeforeStreamCompletion: 'never'
            });
;
        this.aiChat.mount(this.chatUiRef.el);
    }

    reset() {
        this.createAiChat();
    }

    async batchText(message, extras){
        const res = await this.aiChatService.chat(message, extras.conversationHistory, this.state.isStreamingMode);
        return new String(res);
    }

    async streamText(message, observer, extras){
        this.onMessage = (message) => observer.next(String(message));
        this.onStop = () => observer.complete();
        this.onError = (error) => observer.error(error);
        await this.aiChatService.chat(message, extras.conversationHistory, this.state.isStreamingMode);
    }

    toggleStreamingMode(){
        this.state.isStreamingMode = !this.state.isStreamingMode;
        this.reset();
    }

    get isStreamingMode(){
        return this.state.isStreamingMode;
    }

    // #region Mouse Events
    onMouseDown(event) {
        event.preventDefault();

        if (!this.containerRef.el || !this.handleRef.el) {
            return;
        }

        this.state.isResizing = true;
        const bounds = this.containerRef.el.getBoundingClientRect();
        this.refW = bounds.width;
        this.refX = event.clientX;

        document.documentElement.style.cursor = "e-resize";

        this.handleRef.el.classList.add("bg-info")
    }

    onMouseMove(event) {
        event.preventDefault();
        let width = Math.min(Math.max(this.refW + (this.refX - event.clientX), 300), 600);
        this.state.width = `${width}px`;
    }

    onMouseUp() {
        this.state.isResizing = false;
        document.documentElement.style.cursor = "default";
        this.handleRef.el.classList.remove("bg-info")
    }

    // #endregion
}

registry.category("main_components").add("AiDocSidebar", {
    Component: AiDocSidebar,
});
