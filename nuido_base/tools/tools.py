# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from .function_tool import create_object

def get_aux_node_by_role(node, role):
    for node_id in node.definition["aux_nodes"]:
        if ("spec" in node_id) and (node_id["spec"]["role"] == role):
            node_def = next((o for o in node.definitions if o["id"] == node_id["id"]), None)
            if node_def:
                node = create_object(node.env, node.create_function_registry, node.definitions, node_def["type"], node_def)
                return node
    return None

def get_aux_nodes_by_role(node, role):
    res = []
    for node_id in node.definition["aux_nodes"]:
        if ("spec" in node_id) and (node_id["spec"]["role"] == role):
            node_def = next((o for o in node.definitions if o["id"] == node_id["id"]), None)
            if node_def:
                node = create_object(node.env, node.create_function_registry, node.definitions, node_def["type"], node_def)
                res.append(node)
    return res
