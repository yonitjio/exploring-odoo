# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from autogen_ext.tools.mcp import StdioServerParams

class TimeAiMcpNode(BaseNode):
    def _process(self, params):
        tz = self.env.context["user"].tz
        mcp_server = StdioServerParams(command="uvx", args=["mcp-server-time", f"--local-timezone={tz}"])
        return {
            "mcp_server": mcp_server
        }
