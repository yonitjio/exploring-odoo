import { App } from "@odoo/owl";

import { getTemplate } from "@web/core/templates";

import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";
import { _t } from "@web/core/l10n/translation";
import { user } from "@web/core/user";

import { url, imageUrl } from "@web/core/utils/urls";

import { makeRoot, makeShadow } from "./ai_chat_utils";

import { AIChatRoot } from "./ai_chat_root";

const aiChatService = {
    dependencies: ["orm", "localization"],

    getTarget() {
        return document.body;
    },

    initialize(env) {
        const target = this.getTarget();
        const root = makeRoot(target);

        makeShadow(root).then((shadow) => {
            new App(AIChatRoot, {
                env,
                getTemplate,
                translatableAttributes: ["data-tooltip"],
                translateFn: _t,
                dev: env.debug,
            }).mount(shadow);
        });

        return root;
    },

    start(env, services) {

        const root = this.initialize(env);

        async function chat(channel, message, history, { context = {}, streaming = false } = {}) {
            const res = await rpc("/ai_portal_chat/chat", {
                "channel": channel,
                "message": message,
                "history": history,
                "context": context,
                "streaming": streaming,
            });
            return res;
        };

        async function getUserInfo() {
            if (!user.partner_id) {
                const [userData] = await services.orm.silent.read(
                    "res.users",
                    [user.userId],
                    ["partner_id", "name"],
                    { context: { active_test: false } }
                );
                if (userData) {
                    user.partnerId = userData.partner_id[0];
                    user.name = userData.name;
                }
            }

            const userAvatar = imageUrl("res.partner", user.partnerId, "avatar_256", {
                unique: user.writeDate,
            });

            return {
                name: user.name,
                userAvatar: userAvatar,
            };
        };

        function getAssistantAvatar() {
            return url("/ai_portal_chat/static/images/frodoo.png");
        }

        return {
            chat,
            getUserInfo,
            getAssistantAvatar,
            root
        };
    }
};

registry.category("services").add("ai_chat", aiChatService);
