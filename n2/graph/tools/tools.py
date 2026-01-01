"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
import logging

from odoo import SUPERUSER_ID
from odoo.api import Environment
from odoo.modules.registry import Registry

from odoo.tools import safe_eval
from odoo.tools.safe_eval import wrap_module

from .function_tool import create_object

_logger = logging.getLogger(__name__)
html = wrap_module(__import__("html"), ["escape"])

def send_monitoring_notification(env, type, context):
    try:
        with Registry(env.cr.dbname).cursor() as cr:
            my_env = Environment(cr, SUPERUSER_ID, {})
            my_env["bus.bus"]._sendone("broadcast", type, context)
    except Exception as e:
        _logger.debug(f"Unable to send {type} notification.", e)

def run_nodes(env, create_function_registry, definitions, start_node_def, start_params):
    node = create_object(
        env,
        create_function_registry,
        definitions,
        start_node_def["type"],
        start_node_def,
    )
    node_def = start_node_def
    params = start_params
    if node is None:
        return None

    while node is not None:
        params = node.process(params)

        node_info = node.get_next_node_info()
        if node_info is not None:
            node_def = next(
                (o for o in definitions if o["id"] == node_info["id"]), None
            )
            if node_def is not None:
                node = create_object(
                    env,
                    create_function_registry,
                    definitions,
                    node_def["type"],
                    node_def,
                )
            else:
                node = None
        else:
            node = None
    return params


def get_default_context_for_eval(env):
    context = {
        "datetime": safe_eval.datetime,
        "dateutil": safe_eval.dateutil,
        "time": safe_eval.time,
        "json": safe_eval.json,
        "uid": env.uid,
        "user": env.user,
        "html": html,
    }

    if "start_params" in env.context:
        context["start_params"] = env.context["start_params"]
    if "run_params" in env.context:
        context["run_params"] = env.context["run_params"]
    if "payload" in env.context:
        context["payload"] = env.context["payload"]
    if "active_graph_id" in env.context:
        context["active_graph_id"] = env.context["active_graph_id"]
    if "active_graph_uuid" in env.context:
        context["active_graph_uuid"] = env.context["active_graph_uuid"]

    return context


def get_active_record_info(env):
    info = {}

    if "active_id" in env.context:
        info["active_id"] = env.context["active_id"]

    if "active_ids" in env.context:
        info["active_ids"] = env.context["active_ids"]

    if "active_model" in env.context:
        info["active_model"] = env.context["active_model"]

    if "active_model" in env.context and "active_id" in env.context:
        info["active_record"] = env[env.context["active_model"]].browse(
            env.context["active_id"]
        )

    return info


def get_aux_node_def_by_role(node, role):
    for node_id in node.definition["aux_nodes"]:
        if ("spec" in node_id) and (node_id["spec"]["role"] == role):
            node_def = next(
                (o for o in node.definitions if o["id"] == node_id["id"]), None
            )
            if node_def:
                return node_def
    return None

def get_aux_node_defs_by_role(node, role):
    res = []
    for node_id in node.definition["aux_nodes"]:
        if ("spec" in node_id) and (node_id["spec"]["role"] == role):
            node_def = next(
                (o for o in node.definitions if o["id"] == node_id["id"]), None
            )
            if node_def:
                res.append(node_def)
    return res

def get_aux_node_by_role(node, role):
    for node_id in node.definition["aux_nodes"]:
        if ("spec" in node_id) and (node_id["spec"]["role"] == role):
            node_def = next(
                (o for o in node.definitions if o["id"] == node_id["id"]), None
            )
            if node_def:
                node = create_object(
                    node.env,
                    node.create_function_registry,
                    node.definitions,
                    node_def["type"],
                    node_def,
                )
                return node
    return None


def get_aux_nodes_by_role(node, role):
    res = []
    for node_id in node.definition["aux_nodes"]:
        if ("spec" in node_id) and (node_id["spec"]["role"] == role):
            node_def = next(
                (o for o in node.definitions if o["id"] == node_id["id"]), None
            )
            if node_def:
                node = create_object(
                    node.env,
                    node.create_function_registry,
                    node.definitions,
                    node_def["type"],
                    node_def,
                )
                res.append(node)
    return res
