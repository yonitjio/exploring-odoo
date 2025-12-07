# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import logging
_logger = logging.getLogger(__name__)

from typing import Annotated, Literal

from odoo.api import Environment

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from odoo.addons.nuido_flow_ai.flows.ai.odoo_function_tool import OdooFunctionTool

def get_knowledge_base(id: Annotated[int, "Knowledge base Id."], odoo_env: Environment = None) \
    -> Annotated[str | Literal[False], f"Knowledge base content."]:
    try:
        mk = odoo_env["nuido_flow_ai.mini.knowledge"].browse(id)
        if mk:
            return {
                "content": mk["content"]
            }
        else:
            return False
    except Exception as e:
        _logger.error(f"Failed to retrieve knowledge base: {e}")
        return False

class MiniKnowledgeToolNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        ft = OdooFunctionTool(get_knowledge_base, description="Query knowledge base content by Id.", odoo_env=self.env)

        res = {
            "tools": [ft]
        }

        return res
