# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import json

from autogen_core.models import ModelInfo
from autogen_ext.models.openai import OpenAIChatCompletionClient

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class OpenAiChatCompletionClientNode(BaseNode):
    def _process(self, params):
        super()._process(params)
        client = None
        if params["is_structured"]:
            response_format = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "structured_output",
                        "description": "Your reply.",
                        "schema": json.loads(params["schema"]),
                    }
                }

            client = OpenAIChatCompletionClient(
                model=self.definition["model"],
                api_key=self.definition["api_key"],
                base_url=self.definition["base_url"],
                model_info=ModelInfo(family="unknown", function_calling=True, json_output=True, vision=True, structured_output=True ),
                response_format=response_format
            )
        else:
            client = OpenAIChatCompletionClient(
                model=self.definition["model"],
                api_key=self.definition["api_key"],
                base_url=self.definition["base_url"],
                model_info=ModelInfo(family="unknown", function_calling=True, json_output=True, vision=True, structured_output=True ),
            )

        return {
            "client": client
        }