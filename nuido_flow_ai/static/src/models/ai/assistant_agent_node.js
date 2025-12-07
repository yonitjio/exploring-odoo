/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { SpecAwareNodeModel } from "@nuido/models/spec_aware_node";
import { Default } from "@nuido/utils/registry";
import { AiChatCompletionPort } from "@nuido_flow_ai/components/ports/ai_chat_completion_port";
import { AiToolPort } from "@nuido_flow_ai/components/ports/ai_tool_port";
import { AiMcpPort } from "@nuido_flow_ai/components/ports/ai_mcp_port";
import { AiMemoryPort } from "@nuido_flow_ai/components/ports/ai_memory_port";
export class AssistantAgentNodeModel extends SpecAwareNodeModel {
    system_message;
    prompt;
    is_structured;
    schema;
    is_html_result;
    is_reflect_on_tool_use;
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        const chatCompletionAuxInId = "aux-in-" + this.id + "-ai-chat-completion";
        this.addAuxInPort(chatCompletionAuxInId, AiChatCompletionPort.name, 1, {
            role: "ai-chat-completion"
        });
        const aiToolAuxInId = "aux-in-" + this.id + "-ai-tools";
        this.addAuxInPort(aiToolAuxInId, AiToolPort.name, Number.MAX_SAFE_INTEGER, {
            role: "ai-tool"
        });
        const aiMcpAuxInId = "aux-in-" + this.id + "-ai-mcp";
        this.addAuxInPort(aiMcpAuxInId, AiMcpPort.name, 1, {
            role: "ai-mcp"
        });
        const aiMemoryAuxInId = "aux-in-" + this.id + "-ai-memory";
        this.addAuxInPort(aiMemoryAuxInId, AiMemoryPort.name, Number.MAX_SAFE_INTEGER, {
            role: "ai-memory"
        });
        this.system_message = "You are a helpful AI assistant.";
        this.prompt = "{{ run_params['message'] }}";
        this.is_html_result = false;
        this.is_structured = false;
        this.schema = "";
        this.is_reflect_on_tool_use = true;
    }
    getData() {
        const res = super.getData();
        return Object.assign(res, {
            system_message: this.system_message,
            prompt: this.prompt,
            is_structured: this.is_structured,
            schema: this.schema,
            is_html_result: this.is_html_result,
            is_reflect_on_tool_use: this.is_reflect_on_tool_use
        });
    }
}
