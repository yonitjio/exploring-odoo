// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useService } from "@web/core/utils/hooks";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { Node } from "@nuido/components/node";
import { ChatDialogButton } from "@nuido_flow_ai_chat/components/chat/chat_dialog_button";
export class OnAiChatMessageTriggerNode extends Node {
    setup() {
        super.setup();
        this.action = useService("action");
        this.dialog = useService("dialog");
    }
    onBeforeShowChatDialog() {
        const isDocProcessed = this.env.documents[this.env.documents.length - 1].isProcessed;
        if (!isDocProcessed) {
            this.dialog.add(ConfirmationDialog, {
                title: "Information",
                body: "Unable to show chat dialog: document is not processed."
            });
        }
        return isDocProcessed;
    }
    getNodeDefId() {
        return this.action.currentController.action.context.active_id;
    }
}
OnAiChatMessageTriggerNode.template = "nuido_flow_ai_chat.on-ai-chat-message-trigger-node";
OnAiChatMessageTriggerNode.components = {
    ...Node.components,
    ChatDialogButton
};
