"""
© 2025 Yoni
This software is experimental and provided "as-is".
No guarantees, warranties, or liability are assumed.
See the LICENSE file included with this software for full details.
"""
import logging

_logger = logging.getLogger(__name__)

from odoo import http
from odoo.http import request


class N2Controller(http.Controller):
    """Controller for running N2 graph."""

    @http.route("/n2/rungraph", type="jsonrpc", auth="user", website=True)
    def run(self, gid):
        """
        Run a N2 graph.
        Params gid:
            The ID of the N2 graph to run.
        Returns:
            True if the graph was successfully processed.
        """
        # try:
        env = request.env

        graph = env["n2.graph"].browse(gid)
        if not graph.is_processed:
            graph.process_graph()

        monitor_process = (
            env["ir.config_parameter"].get_param("n2.monitor_process", False) == "True"
        )

        context = {
            "uid": env.user.id,
            "user": env.user,
            "is_debug": env.user.has_group("base.group_no_one"),
            "active_graph_id": gid,
            "active_graph_uuid": graph.uuid,
            "monitor_process": monitor_process,
            "skip_monitor": False,
        }

        graph.with_context(**context).run({})
        # except Exception:
        #     _logger.error("Error running N2 graph", exc_info=True)
        #     return False

        return True

    @http.route("/n2/processgraph", type="jsonrpc", auth="user", website=True)
    def process(self, gid):
        """
        Process a N2 graph.
        This method processes the N2 graph.

        Parameters:
            gid (int): The ID of the N2 graph to process.
        Returns:
            bool: True if the N2 graph was processed successfully, False otherwise.
        """
        # try:
        env = request.env

        graph = env["n2.graph"].browse(gid)
        # if not graph.is_processed:
        graph.with_context(skip_monitor=True).process_graph()
        # except Exception as ex:
        #     _logger.error("Error processing N2 graph", exc_info=True)
        #     return False

        return True
