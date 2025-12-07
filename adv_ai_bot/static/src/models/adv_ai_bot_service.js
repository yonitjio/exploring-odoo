/** @odoo-module */

import { registry } from "@web/core/registry";
export class AdvAiBotService {
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
        await this.rpc("/adv_ai_bot/query",{
            thread_id: thread.id,
            thread_model: thread.model,
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

const advAiBotService = {
    dependencies: [
        "rpc",
        "user",
    ],
    start(env, services) {
        return new AdvAiBotService(env, services);
    },
};

registry.category("services").add("adv.ai.bot", advAiBotService);
