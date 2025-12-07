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
import { DataNode } from "@nuido_flow_data/components/data/data_node";
import { DataNodeModel } from "@nuido_flow_data/models/data/data_node";
import { RecordMapNode } from "@nuido_flow_data/components/data/record_map_node";
import { RecordMapNodeModel } from "@nuido_flow_data/models/data/record_map_node";
import { ActiveDataNode } from "@nuido_flow_data/components/data/active_data_node";
import { ActiveDataNodeModel } from "@nuido_flow_data/models/data/active_data_node";
import { UpdateActiveDataNode } from "@nuido_flow_data/components/data/update_active_data_node";
import { UpdateActiveDataNodeModel } from "@nuido_flow_data/models/data/update_active_data_node";
import { DataGroupNode } from "@nuido_flow_data/components/data/data_group_node";
import { DataGroupNodeModel } from "@nuido_flow_data/models/data/data_group_node";
import { BrowseDataNode } from "@nuido_flow_data/components/data/browse_data_node";
import { BrowseDataNodeModel } from "@nuido_flow_data/models/data/browse_data_node";
import { CustomFieldStarterNode } from "@nuido_flow_data/components/starter/custom_field_starter_node";
import { CustomFieldStarterNodeModel } from "@nuido_flow_data/models/starter/custom_field_starter_node";
import { UpdateDataNode } from "@nuido_flow_data/components/data/update_data_node";
import { UpdateDataNodeModel } from "@nuido_flow_data/models/data/update_data_node";
import { CreateDataNode } from "@nuido_flow_data/components/data/create_data_node";
import { CreateDataNodeModel } from "@nuido_flow_data/models/data/create_data_node";
import { ReferenceMapNode } from "@nuido_flow_data/components/data/reference_map_node";
import { ReferenceMapNodeModel } from "@nuido_flow_data/models/data/reference_map_node";
import { LookupNode } from "@nuido_flow_data/components/data/lookup_node";
import { LookupNodeModel } from "@nuido_flow_data/models/data/lookup_node";
import { ArchiveDataNode } from "@nuido_flow_data/components/data/archive_data_node";
import { ArchiveDataNodeModel } from "@nuido_flow_data/models/data/archive_data_node";
import { LookupPort } from "@nuido_flow_data/components/ports/lookup_port";
import { LookupPortModel } from "@nuido_flow_data/models/ports/lookup_port";
import { DataFilterPort } from "@nuido_flow_data/components/ports/data_filter_port";
import { DataFilterPortModel } from "@nuido_flow_data/models/ports/data_filter_port";
import { DynamicDateFilterNode } from "@nuido_flow_data/components/data/dynamic_date_filter_node";
import { DynamicDateFilterNodeModel } from "@nuido_flow_data/models/data/dynamic_date_filter_node";
import { ActionNode } from "@nuido_flow_data/components/data/action_node";
import { ActionNodeModel } from "@nuido_flow_data/models/data/action_node";
// Odoo Nodes
const nuidoNodeRegistry = registry.category(NuidoNodeRegistryName);
nuidoNodeRegistry.add(DataNode.name, {
    component: DataNode,
    model: DataNodeModel
});
nuidoNodeRegistry.add(DataGroupNode.name, {
    component: DataGroupNode,
    model: DataGroupNodeModel
});
nuidoNodeRegistry.add(ActiveDataNode.name, {
    component: ActiveDataNode,
    model: ActiveDataNodeModel
});
nuidoNodeRegistry.add(UpdateActiveDataNode.name, {
    component: UpdateActiveDataNode,
    model: UpdateActiveDataNodeModel
});
nuidoNodeRegistry.add(RecordMapNode.name, {
    component: RecordMapNode,
    model: RecordMapNodeModel
});
nuidoNodeRegistry.add(BrowseDataNode.name, {
    component: BrowseDataNode,
    model: BrowseDataNodeModel
});
nuidoNodeRegistry.add(CustomFieldStarterNode.name, {
    component: CustomFieldStarterNode,
    model: CustomFieldStarterNodeModel
});
nuidoNodeRegistry.add(UpdateDataNode.name, {
    component: UpdateDataNode,
    model: UpdateDataNodeModel
});
nuidoNodeRegistry.add(CreateDataNode.name, {
    component: CreateDataNode,
    model: CreateDataNodeModel
});
nuidoNodeRegistry.add(ReferenceMapNode.name, {
    component: ReferenceMapNode,
    model: ReferenceMapNodeModel
});
nuidoNodeRegistry.add(LookupNode.name, {
    component: LookupNode,
    model: LookupNodeModel
});
nuidoNodeRegistry.add(ArchiveDataNode.name, {
    component: ArchiveDataNode,
    model: ArchiveDataNodeModel
});
nuidoNodeRegistry.add(DynamicDateFilterNode.name, {
    component: DynamicDateFilterNode,
    model: DynamicDateFilterNodeModel
});
nuidoNodeRegistry.add(ActionNode.name, {
    component: ActionNode,
    model: ActionNodeModel
});
// Ports
registry.category(NuidoPortRegistryName).add(LookupPort.name, {
    component: LookupPort,
    model: LookupPortModel
});
registry.category(NuidoPortRegistryName).add(DataFilterPort.name, {
    component: DataFilterPort,
    model: DataFilterPortModel
});
// Menu items
// Odoo
const odooNodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!odooNodeMenuItemsReg.contains("Data")) {
    odooNodeMenuItemsReg.add("Data", {
        app: "nuidoflow",
        category: "Data",
        items: []
    });
}
const odooNodeMenuItems = odooNodeMenuItemsReg.get("Data");
odooNodeMenuItems.items.push({
    title: "Data",
    icon: "/nuido_flow_data/static/images/data-source.svg",
    type: DataNode.name
});
odooNodeMenuItems.items.push({
    title: "Data Group",
    icon: "/nuido_flow_data/static/images/table.svg",
    type: DataGroupNode.name
});
odooNodeMenuItems.items.push({
    title: "Active Data",
    icon: "/nuido_flow_data/static/images/database-star.svg",
    type: ActiveDataNode.name
});
odooNodeMenuItems.items.push({
    title: "Update Active Data",
    icon: "/nuido_flow_data/static/images/database-star.svg",
    type: UpdateActiveDataNode.name
});
odooNodeMenuItems.items.push({
    title: "Record Map",
    icon: "/nuido_flow_data/static/images/data-mapping.svg",
    type: RecordMapNode.name
});
odooNodeMenuItems.items.push({
    title: "Browse Data",
    icon: "/nuido_flow_data/static/images/select.svg",
    type: BrowseDataNode.name
});
odooNodeMenuItems.items.push({
    title: "Custom Field",
    icon: "/nuido_flow_data/static/images/add-column.svg",
    type: CustomFieldStarterNode.name
});
odooNodeMenuItems.items.push({
    title: "Update Data",
    icon: "/nuido_flow_data/static/images/database-update.svg",
    type: UpdateDataNode.name
});
odooNodeMenuItems.items.push({
    title: "Create Data",
    icon: "/nuido_flow_data/static/images/database-new.svg",
    type: CreateDataNode.name
});
odooNodeMenuItems.items.push({
    title: "Reference Map",
    icon: "/nuido_flow_data/static/images/bookmark.svg",
    type: ReferenceMapNode.name
});
odooNodeMenuItems.items.push({
    title: "Lookup",
    icon: "/nuido_flow_data/static/images/database-lookup.svg",
    type: LookupNode.name
});
odooNodeMenuItems.items.push({
    title: "Archive Data",
    icon: "/nuido_flow_data/static/images/database-archive.svg",
    type: ArchiveDataNode.name
});
odooNodeMenuItems.items.push({
    title: "Dynamic Date Filter",
    icon: "/nuido_flow_data/static/images/database-date.svg",
    type: DynamicDateFilterNode.name
});
odooNodeMenuItems.items.push({
    title: "Action",
    icon: "/nuido_flow_data/static/images/lightning.svg",
    type: ActionNode.name
});
