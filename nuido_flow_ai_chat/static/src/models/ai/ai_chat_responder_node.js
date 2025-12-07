// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { SpecAwareNodeModel } from "@nuido/models/spec_aware_node";
import { AiChatResponderPort } from "@nuido_flow_ai_chat/components/ports/ai_chat_responder_port";
export class AiChatResponderNodeModel extends SpecAwareNodeModel {
    setup() {
        const auxInId = "aux-in-" + this.id + "-1";
        this.addAuxInPort(auxInId, AiChatResponderPort.name, Number.MAX_SAFE_INTEGER, {
            role: "ai-chat-responder"
        });
    }
}
