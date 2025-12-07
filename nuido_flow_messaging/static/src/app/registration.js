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
import { NotifyNode } from "@nuido_flow_messaging/components/messaging/notify_node";
import { NotifyNodeModel } from "@nuido_flow_messaging/models/messaging/notify_node";
import { MessageNode } from "@nuido_flow_messaging/components/messaging/message_node";
import { MessageNodeModel } from "@nuido_flow_messaging/models/messaging/message_node";
import { MailNode } from "@nuido_flow_messaging/components/messaging/mail_node";
import { MailNodeModel } from "@nuido_flow_messaging/models/messaging/mail_node";
// Odoo Nodes
const nuidoNodeRegistry = registry.category(NuidoNodeRegistryName);
nuidoNodeRegistry.add(NotifyNode.name, {
    component: NotifyNode,
    model: NotifyNodeModel
});
nuidoNodeRegistry.add(MessageNode.name, {
    component: MessageNode,
    model: MessageNodeModel
});
nuidoNodeRegistry.add(MailNode.name, {
    component: MailNode,
    model: MailNodeModel
});
// Menu items
// Odoo
const odooNodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!odooNodeMenuItemsReg.contains("Messaging")) {
    odooNodeMenuItemsReg.add("Messaging", {
        app: "nuidoflow",
        category: "Messaging",
        items: []
    });
}
const odooNodeMenuItems = odooNodeMenuItemsReg.get("Messaging");
odooNodeMenuItems.items.push({
    title: "Notify",
    icon: "/nuido_flow_messaging/static/images/notification.svg",
    type: NotifyNode.name
});
odooNodeMenuItems.items.push({
    title: "Message",
    icon: "/nuido_flow_messaging/static/images/send-message-dm.svg",
    type: MessageNode.name
});
odooNodeMenuItems.items.push({
    title: "Mail",
    icon: "/nuido_flow_messaging/static/images/mail.svg",
    type: MailNode.name
});
