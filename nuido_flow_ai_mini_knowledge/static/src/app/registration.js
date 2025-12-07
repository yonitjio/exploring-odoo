/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { registry } from "@web/core/registry";
import { NuidoNodeRegistryName } from "@nuido/utils/registry";
import { NuidoSidebarMenuItemRegistryName } from "@nuido_base/utils/registry";
import { MiniKnowledgeMemoryNode } from "@nuido_flow_ai_mini_knowledge/components/ai/mini_knowledge_memory_node";
import { MiniKnowledgeMemoryNodeModel } from "@nuido_flow_ai_mini_knowledge/models/ai/mini_knowledge_memory_node";
import { MiniKnowledgeToolNode } from "@nuido_flow_ai_mini_knowledge/components/ai/mini_knowledge_tool_node";
import { MiniKnowledgeToolNodeModel } from "@nuido_flow_ai_mini_knowledge/models/ai/mini_knowledge_tool_node";
const nuidoNodeRegistry = registry.category(NuidoNodeRegistryName);
nuidoNodeRegistry.add(MiniKnowledgeToolNode.name, {
    component: MiniKnowledgeToolNode,
    model: MiniKnowledgeToolNodeModel
});
nuidoNodeRegistry.add(MiniKnowledgeMemoryNode.name, {
    component: MiniKnowledgeMemoryNode,
    model: MiniKnowledgeMemoryNodeModel
});
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
    title: "Mini Knowledge Tool",
    icon: "/nuido_flow_ai_mini_knowledge/static/images/book-open.svg",
    type: MiniKnowledgeToolNode.name
});
const aiMemoryNodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!aiMemoryNodeMenuItemsReg.contains("AI Memory")) {
    aiMemoryNodeMenuItemsReg.add("AI Memory", {
        app: "nuidoflow",
        category: "AI Memory",
        items: []
    });
}
const aiMemoryNodeMenuItems = aiMemoryNodeMenuItemsReg.get("AI Memory");
aiMemoryNodeMenuItems.items.push({
    title: "Mini Knowledge Memory",
    icon: "/nuido_flow_ai_mini_knowledge/static/images/book.svg",
    type: MiniKnowledgeMemoryNode.name
});
