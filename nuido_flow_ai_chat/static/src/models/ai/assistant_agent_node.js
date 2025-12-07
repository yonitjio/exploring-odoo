// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { AssistantAgentNodeModel as aanm } from "@nuido_flow_ai/models/ai/assistant_agent_node";
import { AiChatResponderPort } from "@nuido_flow_ai_chat/components/ports/ai_chat_responder_port";
export class AssistantAgentNodeModel extends aanm {
    setup() {
        super.setup();
        const auxOutId = "aux-out-" + this.id + "-ai-chat-responder";
        this.addAuxOutPort(auxOutId, AiChatResponderPort.name, 1, {
            role: "ai-chat-responder"
        });
        this.is_streaming = false;
        this.is_stateful = false;
    }
}
