// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { Default } from "@nuido/utils/registry";
import { AiChatResponderPort } from "@nuido_flow_ai_chat/components/ports/ai_chat_responder_port";
export class ManualResponseNodeModel extends NodeModel {
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        const auxOutId = "aux-out-" + this.id + "-ai-chat-responder";
        this.addAuxOutPort(auxOutId, AiChatResponderPort.name, 1, {
            role: "ai-chat-responder"
        });
        this.message = "";
    }
}
