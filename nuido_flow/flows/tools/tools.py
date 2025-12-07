# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

from odoo import SUPERUSER_ID
from odoo.api import Environment
from odoo.modules.registry import Registry

from odoo.tools import safe_eval
from odoo.tools.safe_eval import wrap_module

from odoo.addons.nuido_base.tools.function_tool import create_object

from .log_const import LOGGER_NAME

_logger = logging.getLogger(LOGGER_NAME)
html = wrap_module(__import__('html'), ['escape'])

def send_monitoring_notification(env, type, context):
    try:
        with Registry(env.cr.dbname).cursor() as cr:
            my_env = Environment(cr, SUPERUSER_ID, {})
            my_env['bus.bus']._sendone('broadcast', type, context)
    except Exception as e:
        _logger.debug(f"Unable to send {type} notification.", e)

def run_nodes(env, create_function_registry, definitions, start_node_def, start_params):
    node = create_object(env, create_function_registry, definitions, start_node_def["type"], start_node_def)
    node_def = start_node_def
    params = start_params
    while node is not None:
        params = node.process(params)

        node_info = node.get_next_node_info()
        if node_info is not None:
            node_def = next((o for o in definitions if o["id"] == node_info["id"]), None)
            if node_def is not None:
                node = create_object(env, create_function_registry, definitions, node_def["type"], node_def)
            else:
                node = None
        else:
            node = None

def get_default_context_for_eval(env):
    context = {
        'datetime': safe_eval.datetime,
        'dateutil': safe_eval.dateutil,
        'time': safe_eval.time,
        'json': safe_eval.json,
        'uid': env.uid,
        'user': env.user,
        'html': html
    }

    if "start_params" in env.context:
        context['start_params'] = env.context["start_params"]
    if "run_params" in env.context:
        context['run_params'] = env.context["run_params"]
    if "payload" in env.context:
        context['payload'] = env.context["payload"]
    if "active_node_definition_id" in env.context:
        context['active_node_definition_id'] = env.context["active_node_definition_id"]
    if "active_node_definition_uuid" in env.context:
        context['active_node_definition_uuid'] = env.context["active_node_definition_uuid"]

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
        info["active_record"] = env[env.context["active_model"]].browse(env.context["active_id"])

    return info
