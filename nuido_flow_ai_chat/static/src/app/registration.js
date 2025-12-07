// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { NuidoNodeRegistryName } from "@nuido/utils/registry";
import { NuidoPortRegistryName } from "@nuido/utils/registry";
import { NuidoSidebarMenuItemRegistryName } from "@nuido_base/utils/registry";
import { AssistantAgentNode } from "@nuido_flow_ai_chat/components/ai/assistant_agent_node";
import { AssistantAgentNodeModel } from "@nuido_flow_ai_chat/models/ai/assistant_agent_node";
import { OnAiChatMessageTriggerNode } from "@nuido_flow_ai_chat/components/triggers/on_ai_chat_message_trigger_node";
import { OnAiChatMessageTriggerNodeModel } from "@nuido_flow_ai_chat/models/triggers/on_ai_chat_message_trigger_node";
import { AiChatResponderNode } from "@nuido_flow_ai_chat/components/ai/ai_chat_responder_node";
import { AiChatResponderNodeModel } from "@nuido_flow_ai_chat/models/ai/ai_chat_responder_node";
import { AiChatResponderPort } from "@nuido_flow_ai_chat/components/ports/ai_chat_responder_port";
import { AiChatResponderPortModel } from "@nuido_flow_ai_chat/models/ports/ai_chat_responder_port";
import { ManualResponseNode } from "@nuido_flow_ai_chat/components/ai/manual_response_node";
import { ManualResponseNodeModel } from "@nuido_flow_ai_chat/models/ai/manual_reponse_node";
// AI Nodes
const nuidoNodeRegistry = registry.category(NuidoNodeRegistryName);
nuidoNodeRegistry.remove(AssistantAgentNode.name);
nuidoNodeRegistry.add(AssistantAgentNode.name, {
    component: AssistantAgentNode,
    model: AssistantAgentNodeModel
});
nuidoNodeRegistry.add(AiChatResponderNode.name, {
    component: AiChatResponderNode,
    model: AiChatResponderNodeModel
});
nuidoNodeRegistry.add(ManualResponseNode.name, {
    component: ManualResponseNode,
    model: ManualResponseNodeModel
});
// Triggers
nuidoNodeRegistry.add(OnAiChatMessageTriggerNode.name, {
    component: OnAiChatMessageTriggerNode,
    model: OnAiChatMessageTriggerNodeModel
});
// Ports
registry.category(NuidoPortRegistryName).add(AiChatResponderPort.name, {
    component: AiChatResponderPort,
    model: AiChatResponderPortModel
});
// Menu items
// AI
const aiNodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!aiNodeMenuItemsReg.contains("AI")) {
    aiNodeMenuItemsReg.add("AI", {
        app: "nuidoflow",
        category: "AI",
        items: []
    });
}
const aiNodeMenuItems = aiNodeMenuItemsReg.get("AI");
// Already registered in nuido_flow_ai
// aiNodeMenuItems.items.push({
//     title: "Assistant Agent",
//     icon: "/nuido_flow_ai_chat/static/images/ai.svg",
//     type: AssistantAgentNode.name
// });
aiNodeMenuItems.items.push({
    title: "AI Chat Responder",
    icon: "/nuido_flow_ai_chat/static/images/chatbot.svg",
    type: AiChatResponderNode.name
});
aiNodeMenuItems.items.push({
    title: "Manual Response",
    icon: "/nuido_flow_ai_chat/static/images/chat-round.svg",
    type: ManualResponseNode.name
});
// Triggers
const odooTriggerNodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!odooTriggerNodeMenuItemsReg.contains("Trigger")) {
    odooTriggerNodeMenuItemsReg.add("Trigger", {
        app: "nuidoflow",
        category: "Trigger",
        items: []
    });
}
const odooTriggerNodeMenuItems = odooTriggerNodeMenuItemsReg.get("Trigger");
odooTriggerNodeMenuItems.items.push({
    title: "On AI Chat Message",
    icon: "/nuido_flow_ai_chat/static/images/bot.svg",
    type: OnAiChatMessageTriggerNode.name
});
