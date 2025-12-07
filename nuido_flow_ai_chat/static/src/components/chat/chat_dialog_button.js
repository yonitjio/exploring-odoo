/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { user } from "@web/core/user";
import { url, imageUrl } from "@web/core/utils/urls";
import { uuidv4 } from "@nuido/utils/utils";
import { ChatDialog } from "@nuido_flow_ai_chat/components/chat/chat_dialog";
export class ChatDialogButton extends Component {
    static template = "nuido_flow_ai_chat.chat-dialog-button";
    static props = {
        getNodeDefId: { type: Function },
        beforeShow: { type: Function, optional: true },
        disabled: { type: Boolean, optional: true }
    };
    static defaultProps = {
        disabled: false
    };
    dialog;
    userAvatar;
    assistantAvatar;
    setup() {
        super.setup();
        this.dialog = useService("dialog");
        const { partnerId, writeDate } = user;
        this.userAvatar = imageUrl("res.partner", partnerId, "avatar_256", {
            unique: writeDate,
        });
        this.assistantAvatar = url("/nuido_flow_ai_chat/static/images/ai-chatbot.png");
    }
    showChatDialog() {
        const nodeDefId = this.props.getNodeDefId();
        const token = uuidv4();
        const channel = "nuido-flow-ai-dialog";
        const storeName = "nuido-flow-ai-dialog";
        if (this.props.beforeShow) {
            const proceed = this.props.beforeShow();
            if (!proceed) {
                return;
            }
        }
        this.dialog.add(ChatDialog, {
            title: "AI Chat",
            token: token,
            channel: channel,
            storeName: storeName,
            userName: user.name,
            userAvatarUrl: this.userAvatar,
            assistantName: "Nuido",
            assistantAvatarUrl: this.assistantAvatar,
            nodeDefId: nodeDefId
        });
    }
}
