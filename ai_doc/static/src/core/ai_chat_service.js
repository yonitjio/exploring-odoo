/** @odoo-module */

import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";

const aiDocService = {
    start() {
        const aiChat = {}
        async function chat(message, history, streaming) {
            const res = await rpc("/ai_doc/chat", {
                "message": message,
                "history": history,
                "streaming": streaming,
            });
            return res;
        };

        aiChat.chat = chat;
        return aiChat;
    }
};

registry.category("services").add("ai_doc", aiDocService);
