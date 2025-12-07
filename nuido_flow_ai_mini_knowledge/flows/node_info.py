# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_flow.flows.node_info import getDefaultInfo

from ..flows.ai.mini_knowledge_tool_node import MiniKnowledgeToolNode
from ..flows.ai.mini_knowledge_memory_node import MiniKnowledgeMemoryNode

# NODES
# TOOL NODES
# Mini Knowledge
def build_mini_knowledge_tool_node(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def create_mini_knowledge_tool_node(environment, create_function_registry, definitions, definition):
    return MiniKnowledgeToolNode(environment, create_function_registry, definitions, definition)

# MEMORY NODES
# Mini Knowledge
def build_mini_knowledge_memory_node(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def create_mini_knowledge_memory_node(environment, create_function_registry, definitions, definition):
    return MiniKnowledgeMemoryNode(environment, create_function_registry, definitions, definition)

