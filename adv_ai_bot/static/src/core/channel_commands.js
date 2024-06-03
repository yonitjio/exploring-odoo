/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";

registry.category("discuss.channel_commands").add("clear", {
    help: _t("Clear chat with Adv AI Bot"),
    methodName: "execute_command_clear_ai_chat",
});