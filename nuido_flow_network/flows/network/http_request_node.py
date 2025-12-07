# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

import requests
import json

from odoo.tools import safe_eval
from odoo.tools.rendering_tools import parse_inline_template, render_inline_template

from odoo.addons.nuido_flow.flows.tools.tools import get_default_context_for_eval, get_active_record_info
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

from .tools import get_header_nodes

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

class HttpRequestNode(BaseNode):
    def _process(self, params) -> any:
        super()._process(params)

        context = get_default_context_for_eval(self.env)
        if params is not None:
            context['params'] = params

        info = get_active_record_info(self.env)
        context = {**context, **info}

        header_nodes = get_header_nodes(self)

        all_headers = {}
        for hn in header_nodes:
            headers = hn.process(params)
            all_headers.update(headers)

        method = self.definition["method"]
        url_def = self.definition["url"]

        result = {
            "response": None,
            "exception": None
            }

        try:
            response = None
            url = safe_eval.safe_eval(url_def, context)
            if method == "POST":
                json_def = self.definition["json"]
                json_arg = {}

                json_parsed = parse_inline_template(str(json_def))
                json_string = render_inline_template(json_parsed, context)
                if json_string != "":
                    json_arg = json.loads(json_string)

                data_def = self.definition["data"]
                data_arg = {}
                data_parsed = parse_inline_template(str(data_def))
                data_string = render_inline_template(data_parsed, context)
                if data_string != "":
                    data_arg = json.loads(data_string)

                response = requests.post(url, json=json_arg, data=data_arg, headers=all_headers)
            else:
                params_def = self.definition["params"]
                params_arg = {}
                params_parsed = parse_inline_template(str(params_def))
                params_string = render_inline_template(params_parsed, context)
                if params_string != "":
                    params_arg = json.loads(params_string)
                response = requests.get(url, params=params_arg, headers=all_headers)

            result.update({ "response": response })
            response.raise_for_status()
        except Exception as e:
            result.update({ "exception": e })
            _logger.warning("Exception when sending request.", exc_info=True)

        return result
