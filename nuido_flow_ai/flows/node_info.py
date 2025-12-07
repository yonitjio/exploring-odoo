# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_flow.flows.node_info import getDefaultInfo

from ..flows.ai.assistant_agent_node import AssistantAgentNode
from ..flows.ai.openai_chat_completion_client_node import OpenAiChatCompletionClientNode

from ..flows.ai.date_ai_tool_node import DateAiToolNode

from ..flows.ai.time_ai_mcp_node import TimeAiMcpNode
from ..flows.ai.fetch_ai_mcp_node import FetchAiMcpNode


# NODES
# Assistant Agent
def build_assistant_agent_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["system_message"] = node["system_message"]
    info["prompt"] = node["prompt"]
    info["is_html_result"] = node["is_html_result"]
    info["is_structured"] = node["is_structured"]
    info["schema"] = node["schema"]
    info["is_reflect_on_tool_use"] = node["is_reflect_on_tool_use"]

    return info

def create_assistant_agent_node(environment, create_function_registry, definitions, definition):
    return AssistantAgentNode(environment, create_function_registry, definitions, definition)

# Open AI Chat Completion
def build_openai_chat_completion_client_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["model"] = node["model"]
    info["api_key"] = node["api_key"]
    info["base_url"] = node["base_url"]

    return info

def create_openai_chat_completion_client_node(environment, create_function_registry, definitions, definition):
    return OpenAiChatCompletionClientNode(environment, create_function_registry, definitions, definition)

# TOOL NODES
# Date
def build_date_ai_tool_node(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def create_date_ai_tool_node(environment, create_function_registry, definitions, definition):
    return DateAiToolNode(environment, create_function_registry, definitions, definition)

# MCP NODES
# Time
def build_time_ai_mcp_node(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def create_time_ai_mcp_node(environment, create_function_registry, definitions, definition):
    return TimeAiMcpNode(environment, create_function_registry, definitions, definition)

# Fetch
def build_fetch_ai_mcp_node(node, edges):
    info = getDefaultInfo(node, edges)

    return info

def create_fetch_ai_mcp_node(environment, create_function_registry, definitions, definition):
    return FetchAiMcpNode(environment, create_function_registry, definitions, definition)
