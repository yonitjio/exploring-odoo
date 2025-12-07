# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

import markdown
from markupsafe import Markup

import json

from odoo.tools.json import json_default
from odoo.tools.rendering_tools import parse_inline_template, render_inline_template

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

class NotifyNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        if "uid" in self.env.context and self.env.context["uid"]:
            if "message" in params:
                msg = params["message"]
            else:
                try:
                    variables = {}
                    variables.update(**self.env.context)
                    variables.update(**params)
                    parsed = parse_inline_template(str(self.definition["template"]))
                    msg = render_inline_template(parsed, variables)
                    msg = Markup(markdown.markdown(msg, extensions=['sane_lists']))
                    if msg == "":
                        raise Exception("Empty message.")
                except Exception as ex:
                    _logger.warning("Exception while rendering: %s", self.definition["template"], exc_info=True)
                    msg = "Empty message received."

            user = self.env.context["user"]
            user._bus_send('simple_notification_ex', {
                'type': 'info',
                'title': "Information",
                'message': msg,
                'sticky': self.definition['sticky']
            })

            if "is_debug" in self.env.context and self.env.context["is_debug"]:
                try:
                    msg = "Context:  \n```\n" + json.dumps(self.env.context, indent=4, default=json_default) + "  \n```"
                    msg = msg + "  \n Params:  \n```" + json.dumps(params, indent=4, default=json_default) + "  \n```"
                except Exception as e:
                    pass

                user._bus_send('simple_notification_ex', {
                    'type': 'info',
                    'title': "Debug",
                    'message': Markup(markdown.markdown(msg, extensions=['fenced_code', 'sane_lists'])),
                    'sticky': self.definition['sticky']
                })

        return params
