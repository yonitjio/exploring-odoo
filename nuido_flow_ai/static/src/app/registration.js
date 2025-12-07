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
import { AssistantAgentNode } from "@nuido_flow_ai/components/ai/assistant_agent_node";
import { AssistantAgentNodeModel } from "@nuido_flow_ai/models/ai/assistant_agent_node";
import { OpenAiChatCompletionClientNode } from "@nuido_flow_ai/components/ai/openai_chat_completion_client_node";
import { OpenAiChatCompletionClientNodeModel } from "@nuido_flow_ai/models/ai/openai_chat_completion_client_node";
import { AiChatCompletionPort } from "@nuido_flow_ai/components/ports/ai_chat_completion_port";
import { AiChatCompletionPortModel } from "@nuido_flow_ai/models/ports/ai_chat_completion_port";
import { DateAiToolNode } from "@nuido_flow_ai/components/ai/date_ai_tool_node";
import { DateAiToolNodeModel } from "@nuido_flow_ai/models/ai/date_ai_tool_node";
import { AiToolPort } from "@nuido_flow_ai/components/ports/ai_tool_port";
import { AiToolPortModel } from "@nuido_flow_ai/models/ports/ai_tool_port";
import { AiMcpPort } from "@nuido_flow_ai/components/ports/ai_mcp_port";
import { AiMcpPortModel } from "@nuido_flow_ai/models/ports/ai_mcp_port";
import { TimeAiMcpNode } from "@nuido_flow_ai/components/ai/time_ai_mcp_node";
import { TimeAiMcpNodeModel } from "@nuido_flow_ai/models/ai/time_ai_mcp_node";
import { FetchAiMcpNode } from "@nuido_flow_ai/components/ai/fetch_ai_mcp_node";
import { FetchAiMcpNodeModel } from "@nuido_flow_ai/models/ai/fetch_ai_mcp_node";
// AI Nodes
const nuidoNodeRegistry = registry.category(NuidoNodeRegistryName);
nuidoNodeRegistry.add(AssistantAgentNode.name, {
    component: AssistantAgentNode,
    model: AssistantAgentNodeModel
});
nuidoNodeRegistry.add(OpenAiChatCompletionClientNode.name, {
    component: OpenAiChatCompletionClientNode,
    model: OpenAiChatCompletionClientNodeModel
});
// AI Tool Nodes
nuidoNodeRegistry.add(DateAiToolNode.name, {
    component: DateAiToolNode,
    model: DateAiToolNodeModel
});
// AI MCP Nodes
nuidoNodeRegistry.add(TimeAiMcpNode.name, {
    component: TimeAiMcpNode,
    model: TimeAiMcpNodeModel
});
nuidoNodeRegistry.add(FetchAiMcpNode.name, {
    component: FetchAiMcpNode,
    model: FetchAiMcpNodeModel
});
// Ports
registry.category(NuidoPortRegistryName).add(AiChatCompletionPort.name, {
    component: AiChatCompletionPort,
    model: AiChatCompletionPortModel
});
registry.category(NuidoPortRegistryName).add(AiToolPort.name, {
    component: AiToolPort,
    model: AiToolPortModel
});
registry.category(NuidoPortRegistryName).add(AiMcpPort.name, {
    component: AiMcpPort,
    model: AiMcpPortModel
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
aiNodeMenuItems.items.push({
    title: "Assistant Agent",
    icon: "/nuido_flow_ai/static/images/ai.svg",
    type: AssistantAgentNode.name
});
aiNodeMenuItems.items.push({
    title: "OpenAI Chat Completion",
    icon: "/nuido_flow_ai/static/images/machine-learning.svg",
    type: OpenAiChatCompletionClientNode.name
});
// AI Tool
const aiToolNodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!aiToolNodeMenuItemsReg.contains("AI Tool")) {
    aiToolNodeMenuItemsReg.add("AI Tool", {
        app: "nuidoflow",
        category: "AI Tool",
        items: []
    });
}
const aiToolNodeMenuItems = aiToolNodeMenuItemsReg.get("AI Tool");
aiToolNodeMenuItems.items.push({
    title: "Date",
    icon: "/nuido_flow_ai/static/images/calendar.svg",
    type: DateAiToolNode.name
});
// MCP
const aiMcpNodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!aiMcpNodeMenuItemsReg.contains("MCP")) {
    aiMcpNodeMenuItemsReg.add("MCP", {
        app: "nuidoflow",
        category: "MCP",
        items: []
    });
}
const aiMcpNodeMenuItems = aiMcpNodeMenuItemsReg.get("MCP");
aiMcpNodeMenuItems.items.push({
    title: "Time",
    icon: "/nuido_flow_ai/static/images/clock.svg",
    type: TimeAiMcpNode.name
});
aiMcpNodeMenuItems.items.push({
    title: "Fetch",
    icon: "/nuido_flow_ai/static/images/web.svg",
    type: FetchAiMcpNode.name
});
