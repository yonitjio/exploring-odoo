// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { NuidoNodeRegistryName } from "@nuido/utils/registry";
import { NuidoSidebarMenuItemRegistryName } from "@nuido_base/utils/registry";
import { ChatCompletionAgentNode } from "@nuidoai/components/agents/chat_completion_agent";
import { ChatGroupNode } from "@nuidoai/components/agents/chat_group";
import { ChatCompletionAgentNodeModel } from "@nuidoai/models/agents/chat_completion_agent";
import { ChatGroupNodeModel } from "@nuidoai/models/agents/chat_group";
import { OpenAiChatCompletionServiceNode } from "@nuidoai/components/services/openai_chat_completion_service";
import { OpenAiChatCompletionServiceModel } from "@nuidoai/models/services/openai_chat_completion_service";
import { DatePluginNode } from "@nuidoai/components/plugins/date_plugin";
import { MathPluginNode } from "@nuidoai/components/plugins/math_plugin";
import { RandomNumberPluginNode } from "@nuidoai/components/plugins/rondom_number_plugin";
import { DatePluginNodeModel } from "@nuidoai/models/plugins/date_plugin";
import { MathPluginNodeModel } from "@nuidoai/models/plugins/math_plugin";
import { RandomNumberPluginNodeModel } from "@nuidoai/models/plugins/random_number_plugin";
import { SequentialSelectionStrategyNodeModel } from "@nuidoai/models/strategies/sequential_selection_strategy";
import { SequentialSelectionStrategyNode } from "@nuidoai/components/strategies/sequential_selection_strategy";
import { PromptSelectionStrategyNodeModel } from "@nuidoai/models/strategies/prompt_selection_strategy";
import { PromptSelectionStrategyNode } from "@nuidoai/components/strategies/prompt_selection_strategy";
import { PromptTerminationStrategyNode } from "@nuidoai/components/strategies/prompt_termination_strategy";
import { PromptTerminationStrategyNodeModel } from "@nuidoai/models/strategies/prompt_termination_strategy";
// Agents
registry.category(NuidoNodeRegistryName).add(ChatCompletionAgentNode.name, {
    component: ChatCompletionAgentNode,
    model: ChatCompletionAgentNodeModel
});
registry.category(NuidoNodeRegistryName).add(ChatGroupNode.name, {
    component: ChatGroupNode,
    model: ChatGroupNodeModel
});
// Services
registry.category(NuidoNodeRegistryName).add(OpenAiChatCompletionServiceNode.name, {
    component: OpenAiChatCompletionServiceNode,
    model: OpenAiChatCompletionServiceModel
});
// Plugins
registry.category(NuidoNodeRegistryName).add(DatePluginNode.name, {
    component: DatePluginNode,
    model: DatePluginNodeModel
});
registry.category(NuidoNodeRegistryName).add(MathPluginNode.name, {
    component: MathPluginNode,
    model: MathPluginNodeModel
});
registry.category(NuidoNodeRegistryName).add(RandomNumberPluginNode.name, {
    component: RandomNumberPluginNode,
    model: RandomNumberPluginNodeModel
});
// Strategies
registry.category(NuidoNodeRegistryName).add(SequentialSelectionStrategyNode.name, {
    component: SequentialSelectionStrategyNode,
    model: SequentialSelectionStrategyNodeModel
});
registry.category(NuidoNodeRegistryName).add(PromptSelectionStrategyNode.name, {
    component: PromptSelectionStrategyNode,
    model: PromptSelectionStrategyNodeModel
});
registry.category(NuidoNodeRegistryName).add(PromptTerminationStrategyNode.name, {
    component: PromptTerminationStrategyNode,
    model: PromptTerminationStrategyNodeModel
});
// Menu items
const agentMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName).add("Agents", {
    app: "nuidoai",
    category: "Agents",
    items: []
});
const agentMenuItems = agentMenuItemsReg.get("Agents");
agentMenuItems.items.push({
    title: "Chat Completion",
    icon: "/nuidoai/static/images/robot.svg",
    type: ChatCompletionAgentNode.name
});
agentMenuItems.items.push({
    title: "Group Chat",
    icon: "/nuidoai/static/images/group-chat.svg",
    type: ChatGroupNode.name
});
const selectionStrategyMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName).add("Selection Strategies", {
    app: "nuidoai",
    category: "Selection Strategies",
    items: []
});
const selectionStrategyMenuItems = selectionStrategyMenuItemsReg.get("Selection Strategies");
selectionStrategyMenuItems.items.push({
    title: "Prompt Selection Strategy",
    icon: "/nuidoai/static/images/select.svg",
    type: PromptSelectionStrategyNode.name
});
selectionStrategyMenuItems.items.push({
    title: "Sequential Selection Strategy",
    icon: "/nuidoai/static/images/list.svg",
    type: SequentialSelectionStrategyNode.name
});
const terminationStrategyMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName).add("Termination Strategies", {
    app: "nuidoai",
    category: "Termination Strategies",
    items: []
});
const terminationStrategyMenuItems = terminationStrategyMenuItemsReg.get("Termination Strategies");
terminationStrategyMenuItems.items.push({
    title: "Prompt Termination Strategy",
    icon: "/nuidoai/static/images/stop-circle-line.svg",
    type: PromptTerminationStrategyNode.name
});
const serviceMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName).add("Services", {
    app: "nuidoai",
    category: "Services",
    items: []
});
const serviceMenuItems = serviceMenuItemsReg.get("Services");
serviceMenuItems.items.push({
    title: "OpenAI Chat Completion",
    icon: "/nuidoai/static/images/openai.svg",
    type: OpenAiChatCompletionServiceNode.name
});
const pluginMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName).add("Plugins", {
    app: "nuidoai",
    category: "Plugins",
    items: []
});
const pluginMenuItems = pluginMenuItemsReg.get("Plugins");
pluginMenuItems.items.push({
    title: "Date Plugin",
    icon: "/nuidoai/static/images/date.svg",
    type: DatePluginNode.name
});
pluginMenuItems.items.push({
    title: "Math Plugin",
    icon: "/nuidoai/static/images/math-operations.svg",
    type: MathPluginNode.name
});
pluginMenuItems.items.push({
    title: "Random Number Plugin",
    icon: "/nuidoai/static/images/random.svg",
    type: RandomNumberPluginNode.name
});
