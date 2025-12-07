# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from ..flows.triggers import on_create_trigger_node
from ..flows.triggers import on_delete_trigger_node
from ..flows.triggers import on_edit_trigger_node
from ..flows.triggers import on_schedule_trigger_node
from ..flows.triggers import on_webhook_trigger_node

from odoo.addons.nuido_flow.flows.node_info import getDefaultInfo

# ODOO TRIGGER NODES
# On Create
def build_on_create_trigger_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["model"] = node["model"]
    info["model_description"] = node["model_description"]

    return info

def create_on_create_trigger_node(environment, create_function_registry, definitions, definition):
    return on_create_trigger_node.OnCreateTriggerNode(environment, create_function_registry, definitions, definition)

# On Delete
def build_on_delete_trigger_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["model"] = node["model"]
    info["model_description"] = node["model_description"]

    return info

def create_on_delete_trigger_node(environment, create_function_registry, definitions, definition):
    return on_delete_trigger_node.OnDeleteTriggerNode(environment, create_function_registry, definitions, definition)

# On Edit
def build_on_edit_trigger_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["model"] = node["model"]
    info["model_description"] = node["model_description"]
    info["fields"] = node["fields"]

    return info

def create_on_edit_trigger_node(environment, create_function_registry, definitions, definition):
    return on_edit_trigger_node.OnEditTriggerNode(environment, create_function_registry, definitions, definition)

# On Schedule
def build_on_schedule_trigger_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["interval"] = node["interval"]
    info["interval_type"] = node["interval_type"]

    return info

def create_on_schedule_trigger_node(environment, create_function_registry, definitions, definition):
    return on_schedule_trigger_node.OnScheduleTriggerNode(environment, create_function_registry, definitions, definition)

# On Webhook
def build_on_webhook_trigger_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["webhook_id"] = node["webhook_id"]

    return info

def create_on_webhook_trigger_node(environment, create_function_registry, definitions, definition):
    return on_webhook_trigger_node.OnWebhookTriggerNode(environment, create_function_registry, definitions, definition)
