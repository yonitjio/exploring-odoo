// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";
import { NuidoStudio } from "@nuido_base/app/studio";
import { HorizontalOrthoEdge } from "@nuido_base/components/edges/orthogonal_edge";
import { ChatDialogButton } from "@nuidoai/chat/chat_dialog_button";
class NuidoAiChatStudio extends NuidoStudio {
    async onBeforeShowChatDialog() {
        await this.onSave();
    }
    get appName() {
        return "nuidoai";
    }
    get edgeType() {
        return HorizontalOrthoEdge.name;
    }
    onAfterSave(newId) {
        window.location.assign(("/odoo/nuidoai/" + newId + "/NuidoAiChatStudio"));
    }
}
NuidoAiChatStudio.res_model = "nuidoai.node.definition";
NuidoAiChatStudio.template = "nuidoai.chat-studio";
NuidoAiChatStudio.components = {
    ...NuidoStudio.components,
    ChatDialogButton
};
NuidoAiChatStudio.props = {
    ...standardActionServiceProps,
};
registry.category("actions").add("NuidoAiChatStudio", NuidoAiChatStudio);
