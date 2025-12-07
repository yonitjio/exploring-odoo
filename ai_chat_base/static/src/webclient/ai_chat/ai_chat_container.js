// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.

import { Component, EventBus } from "@odoo/owl";
import { AiChat } from "../ai_chat/ai_chat"

export class AiChatContainer extends Component {
    static components = { AiChat }
    static props = {
        title: { type: String, optional: true },
        greetingMessage: { type: String, optional: true },
        greetUser: { type: Boolean, optional: true },
        storeName: { type: String },
        userName: { type: String, optional: true },
        userAvatarUrl: { type: String },
        assistantName: { type: String, optional: true },
        assistantAvatarUrl: { type: String },
        channel: { type: String },
        bus: { type: Object, optional: true },
    }
    static defaultProps = {
        title: "AI Chat",
        greetingMessage: "",
        greetUser: false,
        userName: "User",
        assistantName: "Assistant",
        bus: new EventBus(),
    }

    update(message) {
        this.props.bus.trigger(this.props.channel + "/message", { message: message });
    }

    reset() {
        this.props.bus.trigger(this.props.channel + "/reset");
    }
}
