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
import { HttpRequestNode } from "@nuido_flow_network/components/network/http_request_node";
import { HttpRequestNodeModel } from "@nuido_flow_network/models/network/http_request_node";
import { HttpHeaderPort } from "@nuido_flow_network/components/ports/http_header_port";
import { HttpHeaderPortModel } from "@nuido_flow_network/models/ports/http_header_port";
import { HttpHeaderNode } from "@nuido_flow_network/components/network/http_header_node";
import { HttpHeaderNodeModel } from "@nuido_flow_network/models/network/http_header_node";
import { GraphQlClientNode } from "@nuido_flow_network/components/network/graphql_client_node";
import { GraphQlClientNodeModel } from "@nuido_flow_network/models/network/graphql_client_node";
import { GraphQlVariablePort } from "@nuido_flow_network/components/ports/graphql_variable_port";
import { GraphQlVariablePortModel } from "@nuido_flow_network/models/ports/graphql_variable_port";
import { GraphQlVariableNode } from "@nuido_flow_network/components/network/graphql_variable_node";
import { GraphQlVariableNodeModel } from "@nuido_flow_network/models/network/graphql_variable_node";
// Nodes
// Http Request
const nuidoNodeRegistry = registry.category(NuidoNodeRegistryName);
nuidoNodeRegistry.add(HttpRequestNode.name, {
    component: HttpRequestNode,
    model: HttpRequestNodeModel
});
nuidoNodeRegistry.add(HttpHeaderNode.name, {
    component: HttpHeaderNode,
    model: HttpHeaderNodeModel
});
nuidoNodeRegistry.add(GraphQlClientNode.name, {
    component: GraphQlClientNode,
    model: GraphQlClientNodeModel
});
nuidoNodeRegistry.add(GraphQlVariableNode.name, {
    component: GraphQlVariableNode,
    model: GraphQlVariableNodeModel
});
// Ports
registry.category(NuidoPortRegistryName).add(HttpHeaderPort.name, {
    component: HttpHeaderPort,
    model: HttpHeaderPortModel
});
registry.category(NuidoPortRegistryName).add(GraphQlVariablePort.name, {
    component: GraphQlVariablePort,
    model: GraphQlVariablePortModel
});
// Menu items
// Network
const nodeMenuItemsReg = registry.category(NuidoSidebarMenuItemRegistryName);
if (!nodeMenuItemsReg.contains("Network")) {
    nodeMenuItemsReg.add("Network", {
        app: "nuidoflow",
        category: "Network",
        items: []
    });
}
const nodeMenuItems = nodeMenuItemsReg.get("Network");
nodeMenuItems.items.push({
    title: "Http Request",
    icon: "/nuido_flow_network/static/images/upload.svg",
    type: HttpRequestNode.name
});
nodeMenuItems.items.push({
    title: "Http Header",
    icon: "/nuido_flow_network/static/images/header.svg",
    type: HttpHeaderNode.name
});
nodeMenuItems.items.push({
    title: "GraphQl Client",
    icon: "/nuido_flow_network/static/images/graphql.svg",
    type: GraphQlClientNode.name
});
nodeMenuItems.items.push({
    title: "GraphQl Variable",
    icon: "/nuido_flow_network/static/images/graphql-variable.svg",
    type: GraphQlVariableNode.name
});
