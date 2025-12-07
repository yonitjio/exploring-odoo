# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_flow.flows.node_info import getDefaultInfo

from odoo.addons.nuido_flow_ai.flows.node_info import build_assistant_agent_node as baan

from ..flows.ai.assistant_agent_node import AssistantAgentNode
from ..flows.ai.manual_response_node import ManualResponseNode
from ..flows.ai.ai_chat_responder_node import AiChatResponderNode

from ..flows.triggers.on_ai_chat_message_trigger_node import OnAiChatMessageTriggerNode

# NODES
# Assistant Agent
def build_assistant_agent_node(node, edges):
    info = baan(node, edges)
    info["is_streaming"] = node["is_streaming"]
    info["is_stateful"] = node["is_stateful"]

    return info

def create_assistant_agent_node(environment, create_function_registry, definitions, definition):
    return AssistantAgentNode(environment, create_function_registry, definitions, definition)

# Manual Response
def build_manual_response_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["message"] = node["message"]

    return info

def create_manual_response_node(environment, create_function_registry, definitions, definition):
    return ManualResponseNode(environment, create_function_registry, definitions, definition)

# AI Chat Responder
def build_ai_chat_responder_node(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def create_ai_chat_responder_node(environment, create_function_registry, definitions, definition):
    return AiChatResponderNode(environment, create_function_registry, definitions, definition)

# TRIGGER NODES
# On Ai Chat Message
def build_on_ai_chat_message_trigger_node(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def create_on_ai_chat_message_trigger_node(environment, create_function_registry, definitions, definition):
    return OnAiChatMessageTriggerNode(environment, create_function_registry, definitions, definition)
