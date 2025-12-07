// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.

import { expect, test } from "@odoo/hoot";
import { animationFrame } from "@odoo/hoot-mock";

import { Component, EventBus, useState, xml } from "@odoo/owl";

import {
    makeMockEnv,
    mountWithCleanup,
} from "@web/../tests/web_test_helpers";

import { url } from "@web/core/utils/urls";
import { AiChat } from "@ai_chat_base/webclient/ai_chat/ai_chat";

class AIChatParent extends Component {
    static components = { AiChat };
    static template = xml`
    <div>
        <AiChat
            userName="this.userName"
            userAvatarUrl="this.userAvatarUrl"

            assistantName="this.assistantName"
            assistantAvatarUrl="this.assistantAvatarUrl"

            greetingMessage="this.greetingMessage"
            greetUser="this.greetUser"

            storeName="this.storeName"

            channel="this.channel"
            bus="this.bus"

            isProcessing="state.isProcessing"

            onBeforeSendMessage.bind="onBeforeSendMessage"
            onSendMessage.bind="onSendMessage"

            allowUpload="true"
        />
    </div>
    `;
    static props = ["*"];

    setup(){
        this.state = useState({
            isProcessing: false
        })

        this.userName = "AI Chat User";
        this.userAvatarUrl = url("/web/static/img/user_placeholder.png");
        this.assistantName = "AI Chatbot";
        this.assistantAvatarUrl = url("/nuido_flow_ai_chat/static/images/ai-chatbot.png");
        this.greetingMessage = "Hello.";
        this.greetUser = true;
        this.storeName = "ai_chat_test";
        this.channel = "ai_chat_test_channel";
        this.bus = new EventBus();
    }

    onBeforeSendMessage(){
        return this.state.isProcessing;
    }

    onSendMessage(message, history){
        console.log(message, history);
    }
}

test("ai chat with greeting", async () => {
    await makeMockEnv();

    class AIChatParentTest extends AIChatParent {
        setup() {
            super.setup();
        }
    }

    await mountWithCleanup(AIChatParentTest);
    await animationFrame();
    expect(".ai-chat").toHaveCount(1);
    expect(".ai-chat-message").toHaveCount(1);
});

test("ai chat without greeting", async () => {
    await makeMockEnv();

    class AIChatParentTest extends AIChatParent {
        setup() {
            super.setup();
            this.greetUser = false;
        }
    }

    await mountWithCleanup(AIChatParentTest);
    await animationFrame();
    expect(".ai-chat").toHaveCount(1);
    expect(".ai-chat-message").toHaveCount(0);
});

test("ai chat", async () => {
    await makeMockEnv();

    class AIChatParentTest extends AIChatParent {
        setup() {
            super.setup();
            this.greetUser = false;
        }
    }

    await mountWithCleanup(AIChatParentTest);
    await animationFrame();
    expect(".ai-chat").toHaveCount(1);
    expect(".ai-chat-message").toHaveCount(0);
});
