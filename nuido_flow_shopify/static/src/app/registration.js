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
import { ShopifyAuthNode } from "@nuido_flow_shopify/components/shopify/shopify_auth_node";
import { ShopifyAuthNodeModel } from "@nuido_flow_shopify/models/shopify/shopify_auth_node";
import { ShopifyHeaderNode } from "@nuido_flow_shopify/components/shopify/shopify_header_node";
import { ShopifyHeaderNodeModel } from "@nuido_flow_shopify/models/shopify/shopify_header_node";
// Shopify Nodes
registry.category(NuidoNodeRegistryName).add(ShopifyAuthNode.name, {
    component: ShopifyAuthNode,
    model: ShopifyAuthNodeModel
});
registry.category(NuidoNodeRegistryName).add(ShopifyHeaderNode.name, {
    component: ShopifyHeaderNode,
    model: ShopifyHeaderNodeModel
});
// Menu items
// Shopify
const nodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!nodeMenuItemsReg.contains("Shopify")) {
    nodeMenuItemsReg.add("Shopify", {
        app: "nuidoflow",
        category: "Shopify",
        items: []
    });
}
const nodeMenuItems = nodeMenuItemsReg.get("Shopify");
// Shopify Auth
nodeMenuItems.items.push({
    title: "Shopify Auth",
    icon: "/nuido_flow_shopify/static/images/shopify-auth.svg",
    type: ShopifyAuthNode.name
});
// Shopify Header
nodeMenuItems.items.push({
    title: "Shopify Header",
    icon: "/nuido_flow_shopify/static/images/shopify-header.svg",
    type: ShopifyHeaderNode.name
});
