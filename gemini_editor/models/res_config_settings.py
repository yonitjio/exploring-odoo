from odoo import models, fields

class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    gemini_api_key = fields.Char(
        string="Gemini API Key",
        help="Type Gemini API key here",
        config_parameter="gemini_editor.gemini_api_key"
    )