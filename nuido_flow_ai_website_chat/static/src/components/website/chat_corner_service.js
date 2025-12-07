/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { Component, markRaw, reactive, xml } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { ChatCorner } from "./chat_corner";
class NuidoFlowAiWebsiteChatCornerWrapper extends Component {
    static template = xml `<t t-component="props.subComponent" t-props="props.subProps" />`;
    static props = ["*"];
}
const websiteChatCornerService = {
    dependencies: ["overlay", "nuido_flow_ai_website_chat"],
    start(_env, services) {
        const subEnv = reactive({
            isActive: false,
            close: () => { }
        });
        const root = services.nuido_flow_ai_website_chat.root;
        const deactivate = () => {
            subEnv.isActive = false;
        };
        function openChat(props, options = { onClose: () => { } }) {
            const close = () => remove();
            subEnv.close = close;
            deactivate();
            const remove = services.overlay.add(NuidoFlowAiWebsiteChatCornerWrapper, {
                subComponent: ChatCorner,
                subProps: markRaw({ ...props, close }),
                subEnv,
            }, {
                onRemove: () => {
                    deactivate();
                    options.onClose?.();
                },
                rootId: root.id
            });
            return remove;
        }
        function closeChat() {
            subEnv.close();
        }
        return {
            openChat: openChat,
            closeChat
        };
    }
};
registry.category("services").add("nuido_flow_ai_website_chat_corner", websiteChatCornerService);
