# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_flow.flows.node_info import getDefaultInfo

from ..flows.network import http_request_node
from ..flows.network import http_header_node
from ..flows.network import graphql_client_node
from ..flows.network import graphql_variable_node

# Http Request
def build_http_request_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["method"] = node["method"]
    info["url"] = node["url"]
    info["data"] = node["data"]
    info["json"] = node["json"]
    info["params"] = node["params"]

    return info

def create_http_request_node(environment, create_function_registry, definitions, definition):
    return http_request_node.HttpRequestNode(environment, create_function_registry, definitions, definition)

# Gttp Header
def build_http_header_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["http_headers"] = node["http_headers"]

    return info

def create_http_header_node(environment, create_function_registry, definitions, definition):
    return http_header_node.HttpHeaderNode(environment, create_function_registry, definitions, definition)

# GraphQl Client
def build_graphql_client_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["url"] = node["url"]
    info["query"] = node["query"]

    return info

def create_graphql_client_node(environment, create_function_registry, definitions, definition):
    return graphql_client_node.GraphQlClientNode(environment, create_function_registry, definitions, definition)

# GraphQl Client
def build_graphql_variable_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["variables"] = node["variables"]

    return info

def create_graphql_variable_node(environment, create_function_registry, definitions, definition):
    return graphql_variable_node.GraphQlVariableNode(environment, create_function_registry, definitions, definition)

