/** @odoo-module */

import { registry } from "@web/core/registry";
export class CalendarBotService {
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
        await this.rpc("/calendar_bot/query",{
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

const calendarBotService = {
    dependencies: [
        "rpc",
        "user",
    ],
    start(env, services) {
        return new CalendarBotService(env, services);
    },
};

registry.category("services").add("calendar.bot", calendarBotService);
