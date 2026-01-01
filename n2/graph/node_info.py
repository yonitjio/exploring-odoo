"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
from ..graph.core import start_node
from ..graph.core import conditional_node
from ..graph.core import spread_node
from ..graph.core import merge_node
from ..graph.core import log_node
from ..graph.core import for_loop_node
from ..graph.core import loop_node
from ..graph.core import looper_node
from ..graph.core import value_node
from ..graph.core import error_node

from ..graph.misc import random_number_node
from ..graph.misc import dummy_node


def findNodeForPort(portId, nodes):
    for node in nodes:
        for port in node["ports"]:
            if port["id"] == portId:
                return node
    return None


def getBasicInfo(node, nodes, edges):
    node_type = node["type"]
    info = {"id": node["id"], "type": node_type}

    next_nodes = []
    outPorts = [port for port in node["ports"] if port["type"] == "output"]
    for outPort in outPorts:
        outgoingEdges = [e for e in edges if e["fromPortId"] == outPort["id"]]
        for edge in outgoingEdges:
            next_node = findNodeForPort(edge["toPortId"], nodes)
            if next_node:
                next_node_info = {"id": next_node["id"]}
                if "spec" in outPort:
                    next_node_info["spec"] = outPort["spec"]

                if "data" in outPort:
                    next_node_info["data"] = outPort["data"]

                next_nodes.append(next_node_info)
            else:
                raise Exception(
                    f"Node not found for edge: {edge["id"]} - {edge["toPortId"]}"
                )

    info["next_nodes"] = next_nodes

    aux_nodes = []
    auxInPorts = [port for port in node["ports"] if port["type"] == "aux-input"]
    for auxInPort in auxInPorts:
        incomingEdges = [e for e in edges if e["toPortId"] == auxInPort["id"]]
        for edge in incomingEdges:
            aux_node = findNodeForPort(edge["fromPortId"], nodes)
            if aux_node:
                aux_node_info = {"id": aux_node["id"]}
                if "spec" in auxInPort:
                    aux_node_info["spec"] = auxInPort["spec"]

                if "data" in auxInPort:
                    aux_node_info["data"] = auxInPort["data"]

                aux_nodes.append(aux_node_info)
            else:
                raise Exception(
                    f"Node not found for edge: {edge["id"]} - {edge["fromPortId"]}"
                )

    info["aux_nodes"] = aux_nodes

    return info


def default_post_process(object, infos):
    return None


# CORE NODES
# Start Node
def build_start_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)
    info["parameters"] = node["data"]["parameters"]

    return info


def create_start_node(environment, create_function_registry, definitions, definition):
    return start_node.StartNode(
        environment, create_function_registry, definitions, definition
    )


# Conditional Node
def build_conditional_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)
    info["condition"] = node["data"]["condition"]

    return info


def create_conditional_node(
    environment, create_function_registry, definitions, definition
):
    return conditional_node.ConditionalNode(
        environment, create_function_registry, definitions, definition
    )


# Log Node
def build_log_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)
    info["tag"] = node["data"]["tag"]

    return info


def create_log_node(environment, create_function_registry, definitions, definition):
    return log_node.LogNode(
        environment, create_function_registry, definitions, definition
    )


# Spread Node
def build_spread_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)

    return info


def create_spread_node(environment, create_function_registry, definitions, definition):
    return spread_node.SpreadNode(
        environment, create_function_registry, definitions, definition
    )


# Merge Node
def build_merge_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)

    return info


def create_merge_node(environment, create_function_registry, definitions, definition):
    return merge_node.MergeNode(
        environment, create_function_registry, definitions, definition
    )

# For Loop Node
def build_for_loop_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)
    info["start_value"] = node["data"]["start_value"]
    info["end_value"] = node["data"]["end_value"]
    info["step"] = node["data"]["step"]

    return info


def create_for_loop_node(environment, create_function_registry, definitions, definition):
    return for_loop_node.ForLoopNode(
        environment, create_function_registry, definitions, definition
    )

# For Loop Node
def build_loop_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)
    info["iterable"] = node["data"]["iterable"]

    return info


def create_loop_node(environment, create_function_registry, definitions, definition):
    return loop_node.LoopNode(
        environment, create_function_registry, definitions, definition
    )

# For Loop Node
def build_looper_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)

    return info


def create_looper_node(environment, create_function_registry, definitions, definition):
    return looper_node.LooperNode(
        environment, create_function_registry, definitions, definition
    )

# Value Node
def build_value_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)
    info["value"] = node["data"]["value"]

    return info


def create_value_node(environment, create_function_registry, definitions, definition):
    return value_node.ValueNode(
        environment, create_function_registry, definitions, definition
    )

# Value Node
def build_error_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)
    info["message"] = node["data"]["message"]

    return info


def create_error_node(environment, create_function_registry, definitions, definition):
    return error_node.ErrorNode(environment, create_function_registry, definitions, definition)

# MISC. NODES
# Random Number Node
def build_random_number_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)
    info["key"] = node["data"]["key"]
    info["from"] = node["data"]["from"]
    info["to"] = node["data"]["to"]

    return info


def create_random_number_node(
    environment, create_function_registry, definitions, definition
):
    return random_number_node.RandomNumberNode(
        environment, create_function_registry, definitions, definition
    )


# Dummy Node
def build_dummy_node(node, nodes, edges):
    info = getBasicInfo(node, nodes, edges)

    return info


def create_dummy_node(environment, create_function_registry, definitions, definition):
    return dummy_node.DummyNode(
        environment, create_function_registry, definitions, definition
    )
