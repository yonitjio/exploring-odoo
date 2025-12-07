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
import { OwlyAuthNode } from "@nuido_flow_owly/components/owly/owly_auth_node";
import { OwlyAuthNodeModel } from "@nuido_flow_owly/models/owly/owly_auth_node";
import { OwlyHeaderNode } from "@nuido_flow_owly/components/owly/owly_header_node";
import { OwlyHeaderNodeModel } from "@nuido_flow_owly/models/owly/owly_header_node";
// Owly Nodes
registry.category(NuidoNodeRegistryName).add(OwlyAuthNode.name, {
    component: OwlyAuthNode,
    model: OwlyAuthNodeModel
});
registry.category(NuidoNodeRegistryName).add(OwlyHeaderNode.name, {
    component: OwlyHeaderNode,
    model: OwlyHeaderNodeModel
});
// Menu items
// Owly
const nodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!nodeMenuItemsReg.contains("Owly")) {
    nodeMenuItemsReg.add("Owly", {
        app: "nuidoflow",
        category: "Owly",
        items: []
    });
}
const nodeMenuItems = nodeMenuItemsReg.get("Owly");
// Owly Auth
nodeMenuItems.items.push({
    title: "Owly Auth",
    icon: "/nuido_flow_owly/static/images/owly-auth.svg",
    type: OwlyAuthNode.name
});
// Owly Header
nodeMenuItems.items.push({
    title: "Owly Header",
    icon: "/nuido_flow_owly/static/images/owly-header.svg",
    type: OwlyHeaderNode.name
});
