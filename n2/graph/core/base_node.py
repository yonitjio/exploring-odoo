"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""

import typing
import logging
from typing_extensions import Protocol

from odoo.api import Environment

from ..tools.tools import send_monitoring_notification

_logger = logging.getLogger(__name__)


@typing.runtime_checkable
class N2Node(Protocol):
    def process(self, params): ...

    def get_next_node_info(self) -> dict | None: ...


class BaseNode(N2Node):
    """
    Base class for all nodes in the graph.

    Args:
        environment (Environment): The Odoo environment.
        create_function_registry (CreateFunctionRegistry): The registry of functions for creating nodes.
        definitions (dict): The definitions of the nodes in the graph.
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

    def _set_next_node(self, params):
        if "next_nodes" in self.definition and len(self.definition["next_nodes"]) > 0:
            self.next_node_info = self.definition["next_nodes"][0]
        else:
            self.next_node_info = None

    def _process(self, params):
        return params

    def _send_monitoring_notification(self, gid, type):
        if self.monitor_process and not self.skip_monitor:
            monitor_context = {
                "node_id": self.id,
                "graph_id": gid,
            }
            send_monitoring_notification(self.env, type, monitor_context)

    def process(self, params):
        _logger.debug(f"Node process start: {self.__class__.__name__}")
        if "active_graph_uuid" in params:
            gid = params["active_graph_uuid"]
        else:
            gid = self.env.context["active_graph_uuid"]
        self._send_monitoring_notification(gid, "start_node_process")

        try:
            self._set_next_node(params)
            res = self._process(params)
        except:
            try:
                self._send_monitoring_notification(gid, "error_node_process")
            except:
                _logger.debug(f"Unable to send monitoring notification: {self.__class__.__name__}")

            raise

        _logger.debug(f"Node process end: {self.__class__.__name__}")
        self._send_monitoring_notification(gid, "end_node_process")

        return res

    def cleanup(self, params):
        return params

    def get_next_node_info(self):
        return self.next_node_info
