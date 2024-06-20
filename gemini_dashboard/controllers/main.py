# -*- coding: utf-8 -*-

import logging
from datetime import datetime, timedelta

import re
import base64
import json
from PIL import Image
from io import BytesIO
from pathlib import Path

import tempfile
import wave
from piper import PiperVoice


from odoo import http, _
from odoo.http import request
from odoo.exceptions import UserError, AccessError

import google.generativeai as gai
from google.ai import generativelanguage as glm

_logger = logging.getLogger(__name__)


class GeminiDashboard(http.Controller):
    def _get_tts_model(self):
        module_dir = Path(__file__).resolve().parent.parent
        model = module_dir.joinpath('lib/piper/en_US-hfc_female-medium.onnx')
        model_config = module_dir.joinpath('lib/piper/en_US-hfc_female-medium.onnx.json')
        dest_dir = module_dir.joinpath('static/generated_voice')
        return module_dir, model, model_config, dest_dir


    @http.route('/gemini_dashboard/statistics', type='json', auth='user')
    def get_statistics(self, period):
        SaleOrder = request.env['sale.order']
        domain = [
            ('state', 'in', ['sale', 'done']),
        ]

        date_begin = datetime.now() - timedelta(days=period)
        if period > 0:
            domain += [('create_date', '>', date_begin)]

        orders = SaleOrder.read_group(domain, ['amount_total'],['date_order:day'])
        return {
            'orders': {
                'date': list(map(lambda o: o['date_order:day'], orders)),
                'amount': list(map(lambda o: o['amount_total'], orders)),
            }
        }

    @http.route('/gemini_dashboard/describe', type='json', auth='user')
    def describe(self, prompt, image):
        try:
            config_parameter = request.env["ir.config_parameter"].sudo()
            gemini_api_key = config_parameter.get_param("gemini_editor.gemini_api_key")
            gemini_model = "gemini-pro-vision"

            image_data = re.sub('^data:image/.+;base64,', '', image)
            img = Image.open(BytesIO(base64.b64decode(image_data)))

            try:
                gai.configure(api_key=gemini_api_key)
                model_instance = gai.GenerativeModel(gemini_model)
                generation_config = gai.types.GenerationConfig(
                    candidate_count=1,
                    max_output_tokens=8192,
                )
                result = model_instance.generate_content(
                    [prompt, img],
                    generation_config = generation_config
                )

                module_dir, model, model_config, dest_dir = self._get_tts_model()

                voice = PiperVoice.load(model, config_path=model_config)
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False, dir=dest_dir) as wav_io:
                    with wave.open(wav_io, "wb") as wav_file:
                        voice.synthesize(result.text, wav_file)

                file_path = str(Path(wav_io.name).relative_to(module_dir.parent))
                return json.dumps({'text': result.text, 'audio': file_path})
            except Exception as e:
                _logger.error(e)
                raise UserError(_(e))
        except AccessError:
            raise AccessError(_("Oops, it looks like our AI is unreachable!"))
