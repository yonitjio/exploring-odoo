# -*- coding: utf-8 -*-

from odoo import fields, models, _
from .ai.prompts import assistant_prompt_string, synth_prompt_string, sql_prompt_string

class ResCompany(models.Model):
    _inherit = "res.company"

    ai_bot_assistant_prompt = fields.Text('Assistant Prompt', default=assistant_prompt_string)
    ai_bot_sql_prompt = fields.Text('SQL Generation Prompt', default=sql_prompt_string)
    ai_bot_synth_prompt = fields.Text('Synthesize Prompt', default=synth_prompt_string)
