# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode
from odoo.addons.nuido_flow_ai.flows.ai.utils import process_template
from .tools import get_chat_responder_node

class ManualResponseNode(BaseNode):
    def __init__(self, environment, create_function_registry, definitions, definition) -> None:
        super().__init__(environment, create_function_registry, definitions, definition)
        self.responder_node = get_chat_responder_node(self)

    def _process(self, params):
        super()._process(params)

        res = ""
        if self.responder_node is not None:
            variables = {}
            variables.update(**self.env.context)
            variables.update(**params)
            res = process_template(self.definition["message"], variables)

            self.responder_node.process({ "message": res, "stop": False })
            self.responder_node.process({ "message": "", "stop": True })

        return {
            "result": res
        }

