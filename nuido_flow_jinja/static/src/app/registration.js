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
import { JinjaNode } from "@nuido_flow_jinja/components/jinja/jinja_node";
import { JinjaNodeModel } from "@nuido_flow_jinja/models/jinja/jinja_node";
// Odoo Nodes
registry.category(NuidoNodeRegistryName).add(JinjaNode.name, {
    component: JinjaNode,
    model: JinjaNodeModel
});
// Menu items
// Jinja
const nodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!nodeMenuItemsReg.contains("Jinja")) {
    nodeMenuItemsReg.add("Jinja", {
        app: "nuidoflow",
        category: "Jinja",
        items: []
    });
}
const nodeMenuItems = nodeMenuItemsReg.get("Jinja");
nodeMenuItems.items.push({
    title: "Jinja",
    icon: "/nuido_flow_jinja/static/images/curly-braces.svg",
    type: JinjaNode.name
});
