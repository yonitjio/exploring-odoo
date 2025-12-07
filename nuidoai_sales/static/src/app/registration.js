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
import { SalesPluginNode } from "@nuidoai_sales/components/plugins/sales_plugin";
import { SalesPluginNodeModel } from "@nuidoai_sales/models/plugins/sales_plugin";
registry.category(NuidoNodeRegistryName).add(SalesPluginNode.name, {
    component: SalesPluginNode,
    model: SalesPluginNodeModel
});
const menuSidebarMenuItemReg = registry.category(NuidoSidebarMenuItemRegistryName);
const pluginMenuItems = menuSidebarMenuItemReg.get("Plugins");
pluginMenuItems.items.push({
    title: "Sales Plugin",
    icon: "/nuidoai_sales/static/images/money-dollars.svg",
    type: SalesPluginNode.name
});
