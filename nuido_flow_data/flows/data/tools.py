# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_base.tools.tools import get_aux_nodes_by_role
from odoo.addons.nuido_base.tools.function_tool import create_object

def get_lookup_nodes(node):
    nodes = {}
    node_process_functions = {}
    if len(node.definition["aux_nodes"]) > 0:
        for node_id in node.definition["aux_nodes"]:
            if ("spec" in node_id) and (node_id["spec"]["role"] == "lookup"):
                node_def = next((o for o in node.definitions if o["id"] == node_id["id"]), None)
                if node_def:
                    node = create_object(node.env, node.create_function_registry, node.definitions, node_def["type"], node_def)
                    if node:
                        nodes[node.definition["key"]] = node
                        node_process_functions[node.definition["key"]] = node.process
    return nodes, node_process_functions

def get_data_filter_nodes(node):
    return get_aux_nodes_by_role(node, "data-filter")
