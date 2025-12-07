/* @odoo-module */

import { Composer } from "@mail/core/common/composer";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";

patch(Composer.prototype, {
    setup() {
        super.setup();
        this.calendarBotService = useService("calendar.bot");
    },
    async _sendMessage(value, postData) {
        await super._sendMessage(value, postData);

        if (value.charAt(0) !== '/'){
            const thread = this.props.composer.thread;
            await this.calendarBotService.query(thread, value);
        }
    }
});
