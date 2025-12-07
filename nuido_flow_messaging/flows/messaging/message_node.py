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

class MessageNode(BaseNode):
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
                    if msg == "":
                        raise Exception()
                except:
                    msg = "Empty message received."

            odoobot_id = self.env['ir.model.data']._xmlid_to_res_id("base.partner_root")

            uid = self.env.context["uid"]

            channel = self.env['discuss.channel'].search([
                    ('channel_type', '=', 'chat'),
                    ('channel_partner_ids', '=', odoobot_id),
                    ('channel_partner_ids', '=', uid),
                ], limit=1)

            channel.message_post(
                    body=Markup(markdown.markdown(msg, extensions=['fenced_code', 'sane_lists'])),
                    author_id=odoobot_id,
                    message_type="comment"
                )

            if "is_debug" in self.env.context and self.env.context["is_debug"]:
                msg = "Context:  \n```\n" + json.dumps(self.env.context, indent=4, default=json_default) + "  \n```"

                try:
                    msg = msg + "  \n Params:  \n```" + json.dumps(params, indent=4, default=json_default) + "  \n```"
                except Exception as e:
                    pass

                channel.message_post(
                        body=Markup(markdown.markdown(msg, extensions=['fenced_code', 'sane_lists'])),
                        author_id=odoobot_id,
                        message_type="comment"
                    )

        return params
