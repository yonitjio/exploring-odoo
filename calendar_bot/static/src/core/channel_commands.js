/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";

registry.category("discuss.channel_commands").add("clear", {
    help: _t("Clear chat with Calendar Bot"),
    methodName: "execute_command_clear_calendar_bot_chat",
});