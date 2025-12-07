/** @odoo-module */

import { registry } from "@web/core/registry";
export class AiBotService {
    constructor(env, services) {
        this.setup(env, services);
    }
    setup(env, services){
        this.env = env;
        this.rpc = services.rpc;
        this.notificationService = services.notification;
        this.user = services.user;
    }
    async _query(thread, query_text){
        await this.rpc("/ai_bot/query",{
            thread_id: thread.id,
            thread_model: thread.model,
            thread_type: thread.type,
            author_id: this.user.partnerId,
            query: query_text,
        });
    }
    async query(thread, query_text) {
        setTimeout(async () => {
            await this._query(thread, query_text)
        }, 250);
    }
}

const aiBotService = {
    dependencies: [
        "rpc",
        "user",
    ],
    start(env, services) {
        return new AiBotService(env, services);
    },
};

registry.category("services").add("ai.bot", aiBotService);
