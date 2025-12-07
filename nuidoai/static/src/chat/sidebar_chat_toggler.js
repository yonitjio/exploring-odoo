// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useState, onWillStart, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { user } from "@web/core/user";
import { url, imageUrl } from "@web/core/utils/urls";
import { SidebarChat } from "@nuidoai/chat/sidebar_chat";
export class SidebarChatToggler extends Component {
    setup() {
        const { partnerId, writeDate } = user;
        this.orm = useService("orm");
        this.company = useState(useService("company"));
        this.notification = useService("notification");
        this.userAvatar = imageUrl("res.partner", partnerId, "avatar_256", {
            unique: writeDate,
        });
        this.assistantAvatar = url("/nuidoai/static/images/ai-chatbot.png");
        onWillStart(() => {
            if (!registry.category("main_components").contains("SidebarChat")) {
                registry.category("main_components").add("SidebarChat", {
                    Component: SidebarChat,
                    props: {
                        title: "AI Chat",
                        channel: "ai-chat",
                        storeName: "ai-chat",
                        offcanvasId: "offcanvasSidebarChat",
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
            const currentCompanyId = this.company.currentCompany.id;
            const nodeDef = await this.orm.searchRead("res.company", [['id', '=', currentCompanyId]], ["node_definition"]);
            res = nodeDef && nodeDef[0]["node_definition"] ? true : false;
        }
        catch {
            console.log("Failed to retrieve company info.");
        }
        return res;
    }
    async hide() {
        const el = document.getElementById("sidebar-chat-toggler");
        el.classList.add("d-none");
    }
    async show() {
        if (await this.isNodeDefinitionSet()) {
            const el = document.getElementById("sidebar-chat-toggler");
            el.classList.remove("d-none");
        }
        else {
            this.notification.add('Chat definition is not set for company.', {
                title: 'Error',
                type: 'danger',
                sticky: false,
            });
        }
    }
}
SidebarChatToggler.template = "nuidoai.sidebar-chat-toggler";
SidebarChatToggler.props = {};
export const sidebarChatTogglerSystrayItem = {
    Component: SidebarChatToggler,
};
registry
    .category("systray")
    .add("SidebarChatTogglerSystrayItem", sidebarChatTogglerSystrayItem, {
    sequence: 1000,
});
