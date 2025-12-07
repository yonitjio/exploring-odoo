import logging

_logger = logging.getLogger(__name__)

from odoo.http import request
from odoo import http, _
from odoo.exceptions import UserError, AccessError

import google.generativeai as gai
from google.ai import generativelanguage as glm


class EditorAIcontroller(http.Controller):
    @http.route("/gemini_editor/generate_text", type="json", auth="user")
    def generate_text(self, prompt):
        try:
            config_parameter = request.env["ir.config_parameter"].sudo()
            gemini_api_key = config_parameter.get_param("gemini_editor.gemini_api_key")
            gemini_model = "gemini-pro"

            try:
                gai.configure(api_key=gemini_api_key)
                model_instance = gai.GenerativeModel(gemini_model)
                generation_config = gai.types.GenerationConfig(
                    candidate_count=1,
                    max_output_tokens=8192,

                )
                result = model_instance.generate_content(
                    prompt,
                    generation_config = generation_config
                )

                return result.text
            except Exception as e:
                _logger.error(e)
                raise UserError(_(e))
        except AccessError:
            raise AccessError(_("Oops, it looks like our AI is unreachable!"))
