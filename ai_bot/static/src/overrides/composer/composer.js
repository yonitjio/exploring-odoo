/* @odoo-module */

import { Composer } from "@mail/core/common/composer";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";

patch(Composer.prototype, {
    setup() {
        super.setup();
        this.aiBotService = useService("ai.bot");
    },
    async _sendMessage(value, postData) {
        await super._sendMessage(value, postData);

        const thread = this.props.composer.thread;
        await this.aiBotService.query(thread, value);
    }
});
