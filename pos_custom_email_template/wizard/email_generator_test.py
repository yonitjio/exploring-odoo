import logging

_logger = logging.getLogger(__name__)

from odoo import _, models, fields
from ..models.email_generator import AiEmailGenerator

class EmailGeneratorTest(models.TransientModel):
    _name = 'email.generator.test'
    _description = "Test Email Generator."

    result_text = fields.Text("Results")
    tone = fields.Selection(
            [
                ("formal", "Formal"),
                ("casual", "Casual"),
                ("direct", "Direct"),
                ("friendly", "Friendly"),
                ("engaging", "Engaging")
            ],
            default='formal',
            string='Tone',
            required=True,
        )

    def action_reset_entries(self):
        self.result_text = ""
        self.tone = "formal"

        return {
            'name': _('Test Email Generator'),
            'type': 'ir.actions.act_window',
            'res_model': 'email.generator.test',
            'view_type': 'form',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'new',
        }

    def action_generate_email(self):
        gen = AiEmailGenerator()
        res = gen.generate_email("Test Store", "John Doe", "ORDER-01-010-0123", self.tone)

        self.result_text = res

        return {
            'name': _('Test Email Generator'),
            'type': 'ir.actions.act_window',
            'res_model': 'email.generator.test',
            'view_type': 'form',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'new',
        }
