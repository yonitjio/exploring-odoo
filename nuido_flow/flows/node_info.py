# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from ..flows.core import start_node
from ..flows.core import conditional_node
from ..flows.core import spread_node
from ..flows.core import merge_node
from ..flows.core import log_node
from ..flows.core import mapper_node

from ..flows.misc import random_number_node

from .tools.mapper_tools import build_dict_map

def getBasicInfo(node, edges):
    node_type = node["nodeType"]
    info = {
        "id": node["id"],
        "type": node_type
    }

    next_nodes = []

    for outPort in node["outPorts"]:
        outgoingEdges = [e for e in edges if e["outPortId"] == outPort["id"]]
        for edge in outgoingEdges:
            next_node = edge["inNodeId"]
            next_node_info = {
                    "id": next_node
                }
            if "spec" in outPort:
                next_node_info["spec"] = outPort["spec"]

            next_nodes.append(next_node_info)

    info["next_nodes"] = next_nodes

    aux_nodes = []
    for auxInPort in node["auxInPorts"]:
        incomingEdges = [e for e in edges if e["inPortId"] == auxInPort["id"]]
        for edge in incomingEdges:
            aux_node = edge["outNodeId"]
            aux_node_info = {
                    "id": aux_node
                }
            if "spec" in auxInPort:
                aux_node_info["spec"] = auxInPort["spec"]

            aux_nodes.append(aux_node_info)

    info["aux_nodes"] = aux_nodes

    return info

def getDefaultInfo(node, edges):
    info = getBasicInfo(node, edges)

    return info

def default_post_process(object, infos):
    return None

# CORE NODES
# Start Node
def build_start_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["parameters"] = node["parameters"]

    return info

def create_start_node(environment, create_function_registry, definitions, definition):
    return start_node.StartNode(environment, create_function_registry, definitions, definition)

# Conditional Node
def build_conditional_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["condition"] = node["condition"]

    return info

def create_conditional_node(environment, create_function_registry, definitions, definition):
    return conditional_node.ConditionalNode(environment, create_function_registry, definitions, definition)

# Log Node
def build_log_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["tag"] = node["tag"]

    return info

def create_log_node(environment, create_function_registry, definitions, definition):
    return log_node.LogNode(environment, create_function_registry, definitions, definition)

# Spread Node
def build_spread_node(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def create_spread_node(environment, create_function_registry, definitions, definition):
    return spread_node.SpreadNode(environment, create_function_registry, definitions, definition)

# Merge Node
def build_merge_node(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def create_merge_node(environment, create_function_registry, definitions, definition):
    return merge_node.MergeNode(environment, create_function_registry, definitions, definition)

# Mapper Node
def build_mapper_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["map"] = node["map"]
    info["dict_map"] = build_dict_map(node["map"])

    return info

def create_mapper_node(environment, create_function_registry, definitions, definition):
    return mapper_node.MapperNode(environment, create_function_registry, definitions, definition)

# MISC. NODES
# Random Number Node
def build_random_number_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["key"] = node["key"]
    info["from"] = node["from"]
    info["to"] = node["to"]

    return info

def create_random_number_node(environment, create_function_registry, definitions, definition):
    return random_number_node.RandomNumberNode(environment, create_function_registry, definitions, definition)

