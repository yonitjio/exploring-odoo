# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from ..flows.messaging import notify_node
from ..flows.messaging import message_node
from ..flows.messaging import mail_node

from odoo.addons.nuido_flow.flows.node_info import getDefaultInfo

# ODOO NODES
# Notify
def build_notify_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["template"] = node["template"]
    info["sticky"] = node["sticky"]

    return info

def create_notify_node(environment, create_function_registry, definitions, definition):
    return notify_node.NotifyNode(environment, create_function_registry, definitions, definition)

# Message
def build_message_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["template"] = node["template"]

    return info

def create_message_node(environment, create_function_registry, definitions, definition):
    return message_node.MessageNode(environment, create_function_registry, definitions, definition)

# Mail
def build_mail_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["subject"] = node["subject"]
    info["template"] = node["template"]
    info["email_tos"] = node["email_tos"]

    return info

def create_mail_node(environment, create_function_registry, definitions, definition):
    return mail_node.MailNode(environment, create_function_registry, definitions, definition)
