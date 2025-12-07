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
        async function chat(channel, message) {
            const res = await rpc("/nuido/chat", {
                "channel": channel,
                "message": message
            });
            return res;
        }
        ;
        async function chatReset() {
            const res = await rpc("/nuido/chat/reset");
            return res;
        }
        ;
        async function testChat(nodeDefId, channel, message) {
            const res = await rpc("/nuido/chat/test", {
                "node_def_id": nodeDefId,
                "channel": channel,
                "message": message
            });
            return res;
        }
        ;
        async function testChatReset(nodeDefId) {
            const res = await rpc("/nuido/chat/test/reset", {
                "node_def_id": nodeDefId
            });
            return res;
        }
        ;
        return {
            chat: chat,
            chatReset: chatReset,
            testChat: testChat,
            testChatReset: testChatReset
        };
    }
};
registry.category("services").add("nuido_flow_ai_chat", chatService);
