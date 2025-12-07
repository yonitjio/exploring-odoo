// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
/** @odoo-module **/
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { user } from "@web/core/user";
import { url, imageUrl } from "@web/core/utils/urls";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { ChatDialog } from "@nuidoai/chat/chat_dialog";
export class ChatDialogButton extends Component {
    setup() {
        super.setup();
        this.dialog = useService("dialog");
        const { partnerId, writeDate } = user;
        this.userAvatar = imageUrl("res.partner", partnerId, "avatar_256", {
            unique: writeDate,
        });
        this.assistantAvatar = url("/nuidoai/static/images/ai-chatbot.png");
    }
    showChatDialog() {
        if (this.props.agentDefId) {
            if (this.props.beforeShow) {
                this.props.beforeShow();
            }
            this.dialog.add(ChatDialog, {
                title: "AI Chat",
                channel: "ai-dialog",
                storeName: "ai-dialog",
                userName: user.name,
                userAvatarUrl: this.userAvatar,
                assistantName: "Nuido",
                assistantAvatarUrl: this.assistantAvatar,
                agentDefId: this.props.agentDefId
            });
        }
        else {
            this.dialog.add(ConfirmationDialog, {
                title: "Information",
                body: "Document is not saved."
            });
        }
    }
}
ChatDialogButton.template = "nuidoai.chat-dialog-button";
ChatDialogButton.props = {
    agentDefId: { type: Number, optional: true },
    beforeShow: { type: Function, optional: true }
};
