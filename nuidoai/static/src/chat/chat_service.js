// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
/** @odoo-module */
import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";
const chatService = {
    start() {
        async function chat(channel, message, history) {
            let hist = history.slice(0, history.length - 2)
                .map((o) => {
                return {
                    "role": o.role,
                    "message": o.content.text
                };
            });
            const res = await rpc("/nuidoai/chat", {
                "channel": channel,
                "message": message,
                "history": hist
            });
            return res;
        }
        ;
        async function testChat(agentDefId, channel, message, history) {
            let hist = history.slice(0, history.length - 2)
                .map((o) => {
                return {
                    "role": o.role,
                    "message": o.content.text
                };
            });
            const res = await rpc("/nuidoai/chat/test", {
                "agent_def_id": agentDefId,
                "channel": channel,
                "message": message,
                "history": hist
            });
            return res;
        }
        ;
        return {
            chat: chat,
            testChat: testChat
        };
    }
};
registry.category("services").add("chat", chatService);
