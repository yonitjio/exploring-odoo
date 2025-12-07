// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, onWillStart, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { user } from "@web/core/user";
import { url, imageUrl } from "@web/core/utils/urls";
import { NuidoFlowSidebarChat } from "@nuido_flow_ai_chat/components/chat/sidebar_chat";
export class NuidoFlowSidebarChatToggler extends Component {
    setup() {
        const { partnerId, writeDate } = user;
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.userAvatar = imageUrl("res.partner", partnerId, "avatar_256", {
            unique: writeDate,
        });
        this.assistantAvatar = url("/nuido_flow_ai_chat/static/images/ai-chatbot.png");
        onWillStart(() => {
            if (!registry.category("main_components").contains("NuidoFlowSidebarChat")) {
                registry.category("main_components").add("NuidoFlowSidebarChat", {
                    Component: NuidoFlowSidebarChat,
                    props: {
                        title: "Nuido Flow AI Chat",
                        channel: "nuido-flow-ai-chat",
                        storeName: "nuido-flow-ai-chat",
                        offcanvasId: "offcanvasNuidoFlowSidebarChat",
                        userName: user.name,
                        userAvatarUrl: this.userAvatar,
                        assistantName: "Nuido",
                        assistantAvatarUrl: this.assistantAvatar,
                    }
                });
            }
        });
        onMounted(async () => {
            if (await this.isNodeDefinitionSet()) {
                this.show();
            }
            else {
                this.hide();
            }
        });
    }
    async isNodeDefinitionSet() {
        let res = false;
        try {
            const nodeDef = await this.orm.searchRead("res.users", [['id', '=', user.userId]], ["nuido_flow_ai_chat_node_definition_id"]);
            res = nodeDef && nodeDef[0]["nuido_flow_ai_chat_node_definition_id"] ? true : false;
        }
        catch {
            console.error("Failed to retrieve AI chat node definition for user.");
        }
        return res;
    }
    async hide() {
        const el = document.getElementById("nuido-flow-sidebar-chat-toggler");
        el.classList.add("d-none");
    }
    async show() {
        if (await this.isNodeDefinitionSet()) {
            const el = document.getElementById("nuido-flow-sidebar-chat-toggler");
            el.classList.remove("d-none");
        }
        else {
            this.notification.add('Chat definition is not set for user.', {
                title: 'Error',
                type: 'danger',
                sticky: false,
            });
        }
    }
}
NuidoFlowSidebarChatToggler.template = "nuido_flow_ai_chat.nuido-flow-sidebar-chat-toggler";
NuidoFlowSidebarChatToggler.props = {};
export const nuidoFlowSidebarChatTogglerSystrayItem = {
    Component: NuidoFlowSidebarChatToggler,
};
registry
    .category("systray")
    .add("NuidoFlowSidebarChatTogglerSystrayItem", nuidoFlowSidebarChatTogglerSystrayItem, {
    sequence: 1000,
});
