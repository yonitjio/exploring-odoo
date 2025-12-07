/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { Component, onWillStart, useExternalListener, useRef, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { debounce } from "@web/core/utils/timing";
import { user } from "@web/core/user";
import { useMovable, makeAwaitableChatCorner } from "./chat_utils";
const CHAT_BUTTON_SIZE = 56;
export class ChatButton extends Component {
    static template = "nuido_flow_ai_website_chat.ChatButton";
    static props = {};
    static DEBOUNCE_DELAY = 500;
    orm;
    bus;
    chat;
    chatCorner;
    ref;
    size;
    position;
    state;
    userAvatar;
    assistantAvatar;
    setup() {
        this.orm = useService("orm");
        this.chat = useService("nuido_flow_ai_website_chat");
        this.chatCorner = useService("nuido_flow_ai_website_chat_corner");
        this.bus = this.env.services.bus_service;
        this.showChatCorner = debounce(this.showChatCorner.bind(this), ChatButton.DEBOUNCE_DELAY, {
            leading: true,
        });
        this.ref = useRef("button");
        this.size = CHAT_BUTTON_SIZE;
        this.position = useState({
            left: `calc(97% - ${CHAT_BUTTON_SIZE}px)`,
            top: `calc(${CHAT_BUTTON_SIZE}px)`,
        });
        this.state = useState({
            isShown: false,
            hasAlreadyMovedOnce: false,
        });
        useMovable({
            ref: this.ref,
            elements: ".o-nuido-flow-ai-website-chat-ChatButton",
            enabled: this.state.isShown,
            onDrop: ({ top, left }) => {
                this.state.hasAlreadyMovedOnce = true;
                this.position.left = `${left}px`;
                this.position.top = `${top}px`;
            },
        });
        useExternalListener(document.body, "scroll", this._onScroll, { capture: true });
        onWillStart(async () => {
            const userInfo = await this.chat.getUserInfo();
            const htmlEl = document.querySelector("html");
            const websiteId = htmlEl.dataset.websiteId ? htmlEl.dataset.websiteId : 0;
            const chatStatus = await this.chat.getWebsiteChatStatus(websiteId);
            let show = false;
            this.userAvatar = userInfo.userAvatar;
            this.assistantAvatar = this.chat.getAssistantAvatar();
            if (user.partnerId && chatStatus.loggedIn) {
                show = true;
            }
            else if (!user.partnerId && chatStatus.guest) {
                show = true;
            }
            this.state.isShown = show;
        });
    }
    _onScroll(ev) {
        if (!this.ref.el || this.state.hasAlreadyMovedOnce) {
            return;
        }
        const container = ev.target;
        this.position.top =
            container.scrollHeight - container.scrollTop === container.clientHeight
                ? `calc(93% - ${CHAT_BUTTON_SIZE}px)`
                : `calc(97% - ${CHAT_BUTTON_SIZE}px)`;
    }
    get isShown() {
        return this.state.isShown;
    }
    async showChatCorner() {
        this.state.isShown = false;
        const bus_channel = this.chat.getToken();
        const channel = "nuido-flow-ai-chat";
        const storeName = "nuido-flow-ai-chat";
        await this.bus.addChannel(bus_channel);
        await makeAwaitableChatCorner(this.chatCorner, {
            title: "AI Corner",
            channel: channel,
            storeName: storeName,
            userName: user.name,
            userAvatarUrl: this.userAvatar,
            assistantAvatarUrl: this.assistantAvatar,
        });
        await this.bus.deleteChannel(bus_channel);
        this.state.isShown = true;
    }
}
