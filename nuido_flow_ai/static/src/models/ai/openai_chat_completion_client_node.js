// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { AiChatCompletionPort } from "@nuido_flow_ai/components/ports/ai_chat_completion_port";
export class OpenAiChatCompletionClientNodeModel extends NodeModel {
    setup() {
        const auxOutId = "aux-out-" + this.id + "-ai-chat-completion";
        this.addAuxOutPort(auxOutId, AiChatCompletionPort.name, Number.MAX_SAFE_INTEGER, {
            role: "ai-chat-completion"
        });
        this.model = "qwen2.5-7b-instruct";
        this.api_key = "__NOT_USED__";
        this.base_url = "http://localhost:1234/v1";
    }
}
