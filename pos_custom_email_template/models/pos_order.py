# -*- coding: utf-8 -*-

import random
import markdown
from markupsafe import Markup

from odoo import _, fields, models
from .email_generator import AiEmailGenerator

class PosOrder(models.Model):
    _inherit = 'pos.order'

    email_receipt_message = fields.Html(string="Email Receipt Message")

    def _prepare_receipt_attachment(self, name, ticket):
        filename = 'Receipt-' + name + '.jpg'
        receipt = self.env['ir.attachment'].create({
            'name': filename,
            'type': 'binary',
            'datas': ticket,
            'res_model': 'pos.order',
            'res_id': self.ids[0],
            'mimetype': 'image/jpeg',
        })
        attachment = [(4, receipt.id)]

        return attachment

    def _prepare_receipt_email_values(self, name, client, ticket):
        tones = ["formal", "casual", "direct", "friendly", "engaging"]
        tone = random.choice(tones)

        gen = AiEmailGenerator()
        content = gen.generate_email(self.config_id.name, client['name'], name, tone)
        self.email_receipt_message = markdown.markdown(content)

        return {
            'subject': _('Receipt %s', name),
            'author_id': self.env.user.partner_id.id,
            'email_to': client['email'],
            'attachment_ids': self._prepare_receipt_attachment(name, ticket)
        }

    def action_receipt_to_customer(self, name, client, ticket):
        if not self:
            return False
        if not client.get('email'):
            return False

        email_template = self.env.ref('pos_custom_email_template.pos_email_template')

        email_values = self._prepare_receipt_email_values(name, client, ticket)
        res_id = self.id

        email_template.send_mail(res_id, force_send=True, email_values=email_values)
