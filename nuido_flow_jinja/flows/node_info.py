# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_flow.flows.node_info import getDefaultInfo

from ..flows.jinja.jinja_node import JinjaNode

def build_jinja_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["template"] = node["template"]
    info["as_dictionary"] = node["as_dictionary"]

    return info

def create_jinja_node(environment, create_function_registry, definitions, definition):
    return JinjaNode(environment, create_function_registry, definitions, definition)
