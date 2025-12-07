// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { Component, useState } from "@odoo/owl";
import { MenuItem } from "@nuido_base/app/menu_item";
import { NuidoSidebarMenuItemRegistryName } from "@nuido_base/utils/registry";
export class SidebarMenu extends Component {
    setup() {
        this.state = useState({
            filter: ''
        });
    }
    get menuItems() {
        const sidebarItemRegistry = registry.category(NuidoSidebarMenuItemRegistryName).getAll();
        const res = sidebarItemRegistry.filter((o) => o.app == this.props.app)
            .sort((a, b) => a.category > b.category ? 1 : a.category < b.category ? -1 : 0);
        res.forEach((o) => {
            o.items.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);
        });
        return res;
    }
    toggleCategory(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.toggle("show");
        }
    }
    toggleSidebar() {
        const el = document.getElementById("sidebar-nav");
        el.classList.toggle("w-0");
        el.classList.toggle("m-3");
        if (el.classList.contains("w-0")) {
            el.classList.remove("overflow-y-auto");
            el.classList.add("overflow-y-hidden");
        }
        else {
            el.classList.remove("overflow-y-hidden");
            el.classList.add("overflow-y-auto");
        }
    }
}
SidebarMenu.template = "nuido_base.sidebar-menu";
SidebarMenu.components = { MenuItem };
SidebarMenu.props = {
    app: String,
    title: String,
    action: Function,
};
