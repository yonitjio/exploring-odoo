# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_flow.flows.node_info import getDefaultInfo

from ..flows.owly.owly_auth_node import OwlyAuthNode
from ..flows.owly.owly_header_node import OwlyHeaderNode

# Owly Auth
def build_owly_auth_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["secret"] = node["secret"]
    info["raise_error"] = node["raise_error"]

    return info

def create_owly_auth_node(environment, create_function_registry, definitions, definition):
    return OwlyAuthNode(environment, create_function_registry, definitions, definition)

# Owly Header
def build_owly_header_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["secret"] = node["secret"]

    return info

def create_owly_header_node(environment, create_function_registry, definitions, definition):
    return OwlyHeaderNode(environment, create_function_registry, definitions, definition)
