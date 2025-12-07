# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import typing
import logging
from typing_extensions import Protocol

from odoo.api import Environment
from odoo.tools import config

from ..tools.log_const import LOGGER_NAME
from ..tools.tools import send_monitoring_notification

_logger = logging.getLogger(LOGGER_NAME)
if 'nuido_flow_log_level' in config.options:
    log_levels = {
        'debug': logging.DEBUG,
        'info': logging.INFO,
        'warning': logging.WARNING,
        'error': logging.ERROR,
        'critical': logging.CRITICAL,
    }

    log_level = log_levels.get(config['nuido_flow_log_level'], logging.INFO)

    logging.basicConfig(level=log_level)
    _logger.setLevel(log_level)

    console = logging.StreamHandler()
    console.setLevel(log_level)

    _logger.addHandler(console)

@typing.runtime_checkable
class FlowNode(Protocol):
    def process(self, params) -> any:
        ...

    def get_next_node_info(self) -> dict | None:
        ...


class BaseNode(FlowNode):
    """
    Base class for all nodes in the flow.

    Args:
        environment (Environment): The Odoo environment.
        create_function_registry (CreateFunctionRegistry): The registry of functions for creating nodes.
        definitions (dict): The definitions of the nodes in the flow.
        definition (dict): The definition of this node.

    """
    def __init__(self, environment, create_function_registry, definitions, definition) -> None:
        self.next_node_info = None
        self.env: Environment = environment
        self.create_function_registry = create_function_registry
        self.definitions = definitions
        self.definition = definition

        self.id = self.definition["id"]

        self.monitor_process = self.env.context["monitor_process"] if "monitor_process" in self.env.context else False
        self.skip_monitor = self.env.context["skip_monitor"] if "skip_monitor" in self.env.context else True

    def _process(self, params) -> any:
        if "next_nodes" in self.definition and len(self.definition["next_nodes"]) > 0:
            self.next_node_info = self.definition["next_nodes"][0]
        else:
            self.next_node_info = None

        return params

    def _send_monitoring_notification(self, type):
        if self.monitor_process and not self.skip_monitor:
            monitor_context = {
                'node_id': self.id,
                'flow_id': self.env.context["active_node_definition_uuid"]
            }
            send_monitoring_notification(self.env, type, monitor_context)

    def process(self, params) -> any:
        _logger.debug(f"Node process start: {self.__class__.__name__}")
        self._send_monitoring_notification('start_node_process')

        try:
            res = self._process(params)
        except:
            try:
                self._send_monitoring_notification('error_node_process')
            except:
                _logger.debug(f"Unable to send monitoring notification: {self.__class__.__name__}")

            raise

        _logger.debug(f"Node process end: {self.__class__.__name__}")
        self._send_monitoring_notification('end_node_process')

        return res

    def get_next_node_info(self):
        return self.next_node_info
