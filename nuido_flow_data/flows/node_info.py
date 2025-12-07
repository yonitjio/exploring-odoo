# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from ..flows.data import data_node
from ..flows.data import data_group_node
from ..flows.data import active_data_node
from ..flows.data import update_active_data_node
from ..flows.data import record_map_node
from ..flows.data import browse_data_node
from ..flows.data import update_data_node
from ..flows.data import create_data_node as create_data_node_module
from ..flows.data import reference_map_node
from ..flows.data import lookup_node
from ..flows.data import archive_data_node
from ..flows.data import dynamic_date_filter_node
from ..flows.data import action_node

from ..flows.starter import custom_field_starter_node

from odoo.addons.nuido_flow.flows.node_info import getDefaultInfo

# ODOO NODES
# Data
def build_data_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["key"] = node["key"]
    info["model"] = node["model"]
    info["fields"] = node["fields"]
    info["domain"] = node["domain"]

    return info

def create_data_node(environment, create_function_registry, definitions, definition):
    return data_node.DataNode(environment, create_function_registry, definitions, definition)

# Data Group
def build_data_group_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["key"] = node["key"]
    info["model"] = node["model"]
    info["fields"] = node["fields"]
    info["domain"] = node["domain"]
    info["aggregate_function"] = node["aggregate_function"]
    info["group_field"] = node["group_field"]
    info["datetime_granularity"] = node["datetime_granularity"]
    info["list_row_limit"] = node["list_row_limit"]
    info["output_type"] = node["output_type"]

    return info

def create_data_group_node(environment, create_function_registry, definitions, definition):
    return data_group_node.DataGroupNode(environment, create_function_registry, definitions, definition)

# Active Data
def build_active_data_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["key"] = node["key"]
    info["model"] = node["model"]
    info["fields"] = node["fields"]

    return info

def create_active_data_node(environment, create_function_registry, definitions, definition):
    return active_data_node.ActiveDataNode(environment, create_function_registry, definitions, definition)

# Update Active Data
def build_update_active_data_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["model"] = node["model"]
    info["fields"] = node["fields"]

    return info

def create_update_active_data_node(environment, create_function_registry, definitions, definition):
    return update_active_data_node.UpdateActiveDataNode(environment, create_function_registry, definitions, definition)

# Record Map
def build_record_map_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["key"] = node["key"]
    info["model"] = node["model"]
    info["record_map"] = node["record_map"]

    return info

def create_record_map_node(environment, create_function_registry, definitions, definition):
    return record_map_node.RecordMapNode(environment, create_function_registry, definitions, definition)

# Browse Data
def build_browse_data_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["model"] = node["model"]
    info["reference_field"] = node["reference_field"]
    info["reference_values"] = node["reference_values"]

    return info

def create_browse_data_node(environment, create_function_registry, definitions, definition):
    return browse_data_node.BrowseDataNode(environment, create_function_registry, definitions, definition)

# Custom Field
def build_custom_field_starter_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["model"] = node["model"]
    info["field_name"] = node["field_name"]
    info["field_description"] = node["field_description"]
    info["remove_field"] = node["remove_field"]

    return info

def create_custom_field_starter_node(environment, create_function_registry, definitions, definition):
    return custom_field_starter_node.CustomFieldStarterNode(environment, create_function_registry, definitions, definition)

# Update Data
def build_update_data_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["ids"] = node["ids"]
    info["model"] = node["model"]
    info["fields"] = node["fields"]

    return info

def create_update_data_node(environment, create_function_registry, definitions, definition):
    return update_data_node.UpdateDataNode(environment, create_function_registry, definitions, definition)

# Create Data
def build_create_data_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["model"] = node["model"]
    info["fields"] = node["fields"]

    return info

def create_create_data_node(environment, create_function_registry, definitions, definition):
    return create_data_node_module.CreateDataNode(environment, create_function_registry, definitions, definition)

# Reference Map
def build_reference_map_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["reference"] = node["reference"]
    info["model"] = node["model"]
    info["field"] = node["field"]

    return info

def create_reference_map_node(environment, create_function_registry, definitions, definition):
    return reference_map_node.ReferenceMapNode(environment, create_function_registry, definitions, definition)

# Lookup
def build_lookup_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["key"] = node["key"]
    info["model"] = node["model"]
    info["lookup_field"] = node["lookup_field"]
    info["value_field"] = node["value_field"]

    return info

def create_lookup_node(environment, create_function_registry, definitions, definition):
    return lookup_node.LookupNode(environment, create_function_registry, definitions, definition)

# Archive Data
def build_archive_data_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["ids"] = node["ids"]
    info["model"] = node["model"]

    return info

def create_archive_data_node(environment, create_function_registry, definitions, definition):
    return archive_data_node.ArchiveDataNode(environment, create_function_registry, definitions, definition)

# Dynamic Date Filter
def build_dynamic_date_filter_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["model"] = node["model"]
    info["dynamic_date_field"] = node["dynamic_date_field"]
    info["dynamic_date_interval"] = node["dynamic_date_interval"]

    return info

def create_dynamic_date_filter_node(environment, create_function_registry, definitions, definition):
    return dynamic_date_filter_node.DynamicDateFilterNode(environment, create_function_registry, definitions, definition)

# Action
def build_action_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["ids"] = node["ids"]
    info["model"] = node["model"]
    info["action"] = node["action"]

    return info

def create_action_node(environment, create_function_registry, definitions, definition):
    return action_node.ActionNode(environment, create_function_registry, definitions, definition)

