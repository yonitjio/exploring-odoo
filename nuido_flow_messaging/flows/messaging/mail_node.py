# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

from odoo.tools.safe_eval import wrap_module
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
_logger = logging.getLogger(LOGGER_NAME)

class MailNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        try:
            node_def_id = self.env.context["active_node_definition_id"]
            odoobot = self.env.ref('base.partner_root')

            users = self.env['res.users'].search([
                    ('id', 'in', [int(user['id']) for user in self.definition["email_tos"]]),
                    ('email', '!=', False),
                ])
            if len(users) > 0:

                variables = {}
                variables.update(**self.env.context)
                variables.update(**params)

                markupsafe = wrap_module(__import__('markupsafe'), ['Markup'])
                variables.update({
                        "markupsafe": markupsafe
                    })

                subject = self.definition["subject"]

                emails = [users[i].email for i in range(len(users))]
                email_values = {
                    'email_to': ",".join(emails),
                }

                user_lang = odoobot.lang or self.env.lang or 'en_US'
                email_message_content = self.env['mail.render.mixin'].with_context(lang=user_lang)._render_template(
                    template_src=self.definition["template"],
                    model='nuido_flow.node.definition',
                    res_ids=[node_def_id],
                    engine='qweb',
                    add_context=variables,
                    options={'post_process': True})[node_def_id]

                body = self.env['mail.render.mixin'].with_context(lang=user_lang)._render_template(
                    template_src='nuido_flow_messaging.nuido_flow_email_template',
                    model='nuido_flow.node.definition',
                    res_ids=[node_def_id],
                    engine='qweb_view',
                    add_context={ "email_message_content": email_message_content },
                    options={'post_process': True})[node_def_id]

                mail = self.env['mail.mail'].sudo().create({
                    'subject': subject,
                    'email_from': odoobot.email_formatted,
                    'body_html': body,
                    **email_values,
                })
                mail.send()
        except:
            _logger.warning("Exception while sending email.", exc_info=True)

        return params
