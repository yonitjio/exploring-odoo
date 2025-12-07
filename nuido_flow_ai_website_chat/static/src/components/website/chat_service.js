/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { App } from "@odoo/owl";
import { getTemplate } from "@web/core/templates";
import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";
import { _t } from "@web/core/l10n/translation";
import { user } from "@web/core/user";
import { url, imageUrl } from "@web/core/utils/urls";
import { makeRoot, makeShadow, uuidv4 } from "./chat_utils";
import { NuidoFlowAIWebsiteChatRoot } from "./chat_root";
const websiteChatService = {
    dependencies: ["orm", "localization"],
    getTarget() {
        return document.body;
    },
    initialize(env) {
        const target = this.getTarget();
        const root = makeRoot(target);
        makeShadow(root).then((shadow) => {
            new App(NuidoFlowAIWebsiteChatRoot, {
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
        const token = uuidv4();
        function getToken() {
            return token;
        }
        async function chat(channel, message, { context = {} } = {}) {
            const res = await rpc("/nuido/webchat", {
                "token": token,
                "channel": channel,
                "message": message,
                "context": context
            });
            return res;
        }
        ;
        async function chatReset() {
            const res = await rpc("/nuido/webchat/reset", {
                "token": token,
            });
            return res;
        }
        ;
        async function getWebsiteChatStatus(websiteId) {
            const res = await rpc("/nuido/webchat/status", {
                websiteId: websiteId
            });
            return res;
        }
        async function getUserInfo() {
            if (user.userId) {
                if (!user.partner_id) {
                    const [userData] = await services.orm.silent.read("res.users", [user.userId], ["partner_id", "name"], { context: { active_test: false } });
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
            }
            else {
                return {
                    name: "Visitor",
                    userAvatar: "/nuido_flow_ai_website_chat/static/images/guest.png"
                };
            }
        }
        ;
        function getAssistantAvatar() {
            return url("/nuido_flow_ai_website_chat/static/images/frodoo.png");
        }
        return {
            chat,
            chatReset,
            getUserInfo,
            getAssistantAvatar,
            getWebsiteChatStatus,
            getToken,
            root
        };
    }
};
registry.category("services").add("nuido_flow_ai_website_chat", websiteChatService);
