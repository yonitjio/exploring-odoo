# -*- coding: utf-8 -*-

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    ai_bot_assistant_prompt = fields.Text('Assistant Prompt', related='company_id.ai_bot_assistant_prompt', readonly=False)
    ai_bot_sql_prompt = fields.Text('SQL Generation Prompt', related='company_id.ai_bot_sql_prompt', readonly=False)
    ai_bot_synth_prompt = fields.Text('Synthesize Prompt', related='company_id.ai_bot_synth_prompt', readonly=False)
