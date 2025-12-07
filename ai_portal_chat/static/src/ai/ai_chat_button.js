import { Component, onWillStart, useExternalListener, useRef, useState } from "@odoo/owl";

import { useService } from "@web/core/utils/hooks";
import { debounce } from "@web/core/utils/timing";

import { user } from "@web/core/user";

import { useMovable, makeAwaitableAiCorner, uuidv4 } from "./ai_chat_utils"

const AI_CHAT_BUTTON_SIZE = 56;

export class AIChatButton extends Component {
    static template = "ai_portal_chat.AIChatButton";
    static props = {};
    static DEBOUNCE_DELAY = 500; //'animationFrame';

    setup() {
        this.aiChat = useService("ai_chat");
        this.aiCorner = useService("ai_corner");

        this.busService = this.env.services.bus_service;

        this.showAiCorner = debounce(this.showAiCorner.bind(this), AIChatButton.DEBOUNCE_DELAY, {
            leading: true,
        });

        this.ref = useRef("button");

        this.size = AI_CHAT_BUTTON_SIZE;

        this.position = useState({
            left: `calc(97% - ${AI_CHAT_BUTTON_SIZE}px)`,
            top: `calc(${AI_CHAT_BUTTON_SIZE}px)`,
        });

        this.state = useState({
            isShown: false,
            hasAlreadyMovedOnce: false,
        });

        useMovable({
            ref: this.ref,
            elements: ".o-ai-portal-chat-AIChatButton",
            enabled: this.state.isShown,
            onDrop: ({ top, left }) => {
                this.state.hasAlreadyMovedOnce = true;
                this.position.left = `${left}px`;
                this.position.top = `${top}px`;
            },
        });

        useExternalListener(document.body, "scroll", this._onScroll, { capture: true });

        onWillStart(async () => {
            if (user.userId) {
                const userInfo = await this.aiChat.getUserInfo();

                this.userAvatar = userInfo.userAvatar;
                this.assistantAvatar = this.aiChat.getAssistantAvatar();

                this.state.isShown = user.partnerId ? true : false;
            }
        });
    }

    _onScroll(ev) {
        if (!this.ref.el || this.state.hasAlreadyMovedOnce) {
            return;
        }
        const container = ev.target;
        this.position.top =
            container.scrollHeight - container.scrollTop === container.clientHeight
                ? `calc(93% - ${AI_CHAT_BUTTON_SIZE}px)`
                : `calc(97% - ${AI_CHAT_BUTTON_SIZE}px)`;
    }

    get isShown() {
        return this.state.isShown;
    }

    async showAiCorner() {
        this.state.isShown = false;
        const channel = "ai-portal-corner-" + uuidv4();

        await this.busService.addChannel(channel);

        await makeAwaitableAiCorner(this.aiCorner, {
            title: "AI Corner",
            channel: channel,
            storeName: "ai-portal-corner",
            userName: user.name,
            userAvatarUrl: this.userAvatar,
            assistantAvatarUrl: this.assistantAvatar,
        });

        await this.busService.deleteChannel(channel);

        this.state.isShown = true;
    }
}
