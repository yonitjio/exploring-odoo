// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { NuidoNodeRegistryName, NuidoPortRegistryName } from "@nuido/utils/registry";
import { NuidoSidebarMenuItemRegistryName } from "@nuido_base/utils/registry";
import { TriggerPort } from "@nuido_flow/components/ports/trigger_port";
import { TriggerPortModel } from "@nuido_flow/models/ports/trigger_port";
import { StartNode } from "@nuido_flow/components/core/start_node";
import { StartNodeModel } from "@nuido_flow/models/core/start_node";
import { SpreadNode } from "@nuido_flow/components/core/spread_node";
import { SpreadNodeModel } from "@nuido_flow/models/core/spread_node";
import { RandomNumberNode } from "@nuido_flow/components/misc/random_number_node";
import { RandomNumberNodeModel } from "@nuido_flow/models/misc/random_number_node";
import { LogNode } from "@nuido_flow/components/core/log_node";
import { LogNodeModel } from "@nuido_flow/models/core/log_node";
import { ConditionalNode } from "@nuido_flow/components/core/conditional_node";
import { ConditionalNodeModel } from "@nuido_flow/models/core/conditional_node";
import { MergeNode } from "@nuido_flow/components/core/merge_node";
import { MergeNodeModel } from "@nuido_flow/models/core/merge_node";
import { MapperNode } from "@nuido_flow/components/core/mapper_node";
import { MapperNodeModel } from "@nuido_flow/models/core/mapper_node";
import { StarterPort } from "@nuido_flow/components/ports/starter_port";
import { StarterPortModel } from "@nuido_flow/models/ports/starter_port";
// Core Nodes
const nuidoNodeRegistry = registry.category(NuidoNodeRegistryName);
nuidoNodeRegistry.add(StartNode.name, {
    component: StartNode,
    model: StartNodeModel
});
nuidoNodeRegistry.add(LogNode.name, {
    component: LogNode,
    model: LogNodeModel
});
nuidoNodeRegistry.add(ConditionalNode.name, {
    component: ConditionalNode,
    model: ConditionalNodeModel
});
nuidoNodeRegistry.add(SpreadNode.name, {
    component: SpreadNode,
    model: SpreadNodeModel
});
nuidoNodeRegistry.add(MergeNode.name, {
    component: MergeNode,
    model: MergeNodeModel
});
nuidoNodeRegistry.add(MapperNode.name, {
    component: MapperNode,
    model: MapperNodeModel
});
// Misc. Nodes
nuidoNodeRegistry.add(RandomNumberNode.name, {
    component: RandomNumberNode,
    model: RandomNumberNodeModel
});
// Port
registry.category(NuidoPortRegistryName).add(TriggerPort.name, {
    component: TriggerPort,
    model: TriggerPortModel
});
registry.category(NuidoPortRegistryName).add(StarterPort.name, {
    component: StarterPort,
    model: StarterPortModel
});
// Menu items
// Core
const coreNodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName).add("Core", {
    app: "nuidoflow",
    category: "Core",
    items: []
});
const coreNodeMenuItems = coreNodeMenuItemsReg.get("Core");
coreNodeMenuItems.items.push({
    title: "Start",
    icon: "/nuido_flow/static/images/play.svg",
    type: StartNode.name
});
coreNodeMenuItems.items.push({
    title: "Conditional",
    icon: "/nuido_flow/static/images/diamond.svg",
    type: ConditionalNode.name
});
coreNodeMenuItems.items.push({
    title: "Log",
    icon: "/nuido_flow/static/images/log.svg",
    type: LogNode.name
});
coreNodeMenuItems.items.push({
    title: "Spread",
    icon: "/nuido_flow/static/images/branch-git-fork.svg",
    type: SpreadNode.name
});
coreNodeMenuItems.items.push({
    title: "Merge",
    icon: "/nuido_flow/static/images/merge-cells.svg",
    type: MergeNode.name
});
coreNodeMenuItems.items.push({
    title: "Mapper",
    icon: "/nuido_flow/static/images/network-mapping.svg",
    type: MapperNode.name
});
// Misc
const miscNodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName).add("Misc", {
    app: "nuidoflow",
    category: "Misc.",
    items: []
});
const miscNodeMenuItems = miscNodeMenuItemsReg.get("Misc");
miscNodeMenuItems.items.push({
    title: "Random Number",
    icon: "/nuido_flow/static/images/random.svg",
    type: RandomNumberNode.name
});
