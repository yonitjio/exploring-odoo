# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_base.tools.function_tool import create_object

def get_chat_responder_node(node):
    responders = [o for o in node.definitions if len(o["aux_nodes"]) > 0
        and any(aux_nodes["spec"]["role"] == "ai-chat-responder" for aux_nodes in o["aux_nodes"])]

    for responder in responders:
        node_info = next((o for o in responder["aux_nodes"] if o["id"] == node.definition["id"] ), None)
        if node_info:
            responder_node = create_object(node.env, node.create_function_registry, node.definitions, responder["type"], responder)
            return responder_node

    return None