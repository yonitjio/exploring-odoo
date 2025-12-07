// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { AssistantAgentNode as aan } from "@nuido_flow_ai/components/ai/assistant_agent_node";
export class AssistantAgentNode extends aan {
    onIsStreamingResponseChanged(event) {
        if (!this.props.node.is_streaming) {
            this.props.node.is_streaming = true;
        }
        else {
            this.props.node.is_streaming = false;
        }
    }
    onIsStatefulChanged(event) {
        if (!this.props.node.is_stateful) {
            this.props.node.is_stateful = true;
        }
        else {
            this.props.node.is_stateful = false;
        }
    }
    get isStreamingInputId() {
        return `input-${this.props.node.id}-is-streaming-response`;
    }
    get isStatefulInputId() {
        return `input-${this.props.node.id}-is-stateful`;
    }
}
AssistantAgentNode.template = "nuido_flow_ai_chat.assistant-agent-node";
