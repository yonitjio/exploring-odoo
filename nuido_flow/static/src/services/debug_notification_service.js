// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
/* @odoo-module */
import { markup } from "@odoo/owl";
import { registry } from "@web/core/registry";
export const debugNotificationService = {
    dependencies: ["bus_service", "notification"],
    start(env, { bus_service, notification: notificationService }) {
        bus_service.subscribe("simple_notification_ex", ({ message, sticky, title, type }) => {
            // @ts-ignore
            let msg = markup(DOMPurify.sanitize(message, { FORCE_BODY: true }));
            notificationService.add(msg, {
                sticky,
                title,
                type,
                className: "nuido-flow-notification"
            });
        });
        bus_service.start();
    },
};
registry.category("services").add("simple_notification_ex", debugNotificationService);
