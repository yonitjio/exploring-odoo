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
import { OnCreateTriggerNode } from "@nuido_flow_trigger/components/triggers/on_create_trigger_node";
import { OnCreateTriggerNodeModel } from "@nuido_flow_trigger/models/triggers/on_create_trigger_node";
import { OnEditTriggerNode } from "@nuido_flow_trigger/components/triggers/on_edit_trigger_node";
import { OnEditTriggerNodeModel } from "@nuido_flow_trigger/models/triggers/on_edit_trigger_node";
import { OnDeleteTriggerNode } from "@nuido_flow_trigger/components/triggers/on_delete_trigger_node";
import { OnDeleteTriggerNodeModel } from "@nuido_flow_trigger/models/triggers/on_delete_trigger_node";
import { OnScheduleTriggerNode } from "@nuido_flow_trigger/components/triggers/on_schedule_trigger_node";
import { OnScheduleTriggerNodeModel } from "@nuido_flow_trigger/models/triggers/on_schedule_trigger_node";
import { OnWebhookTriggerNode } from "@nuido_flow_trigger/components/triggers/on_webhook_trigger_node";
import { OnWebhookTriggerNodeModel } from "@nuido_flow_trigger/models/triggers/on_webhook_trigger_node";
// Odoo Trigger Nodes
const nuidoNodeRegistry = registry.category(NuidoNodeRegistryName);
nuidoNodeRegistry.add(OnCreateTriggerNode.name, {
    component: OnCreateTriggerNode,
    model: OnCreateTriggerNodeModel
});
nuidoNodeRegistry.add(OnDeleteTriggerNode.name, {
    component: OnCreateTriggerNode,
    model: OnDeleteTriggerNodeModel
});
nuidoNodeRegistry.add(OnEditTriggerNode.name, {
    component: OnEditTriggerNode,
    model: OnEditTriggerNodeModel
});
nuidoNodeRegistry.add(OnScheduleTriggerNode.name, {
    component: OnScheduleTriggerNode,
    model: OnScheduleTriggerNodeModel
});
nuidoNodeRegistry.add(OnWebhookTriggerNode.name, {
    component: OnWebhookTriggerNode,
    model: OnWebhookTriggerNodeModel
});
// Menu items
// Odoo Triggers
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
    title: "On Create",
    icon: "/nuido_flow_trigger/static/images/fire.svg",
    type: OnCreateTriggerNode.name
});
odooTriggerNodeMenuItems.items.push({
    title: "On Delete",
    icon: "/nuido_flow_trigger/static/images/delete-left.svg",
    type: OnDeleteTriggerNode.name
});
odooTriggerNodeMenuItems.items.push({
    title: "On Edit",
    icon: "/nuido_flow_trigger/static/images/edit.svg",
    type: OnEditTriggerNode.name
});
odooTriggerNodeMenuItems.items.push({
    title: "On Schedule",
    icon: "/nuido_flow_trigger/static/images/schedule.svg",
    type: OnScheduleTriggerNode.name
});
odooTriggerNodeMenuItems.items.push({
    title: "On Webhook",
    icon: "/nuido_flow_trigger/static/images/webhook.svg",
    type: OnWebhookTriggerNode.name
});
