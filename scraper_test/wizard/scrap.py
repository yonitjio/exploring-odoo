import logging

_logger = logging.getLogger(__name__)

import re
from odoo import _, models, fields

from .crawl_utils import test_playwright, test_selenium, test_crawl4ai

class ScraperWizard(models.TransientModel):
    _name = "scrap.wizard"
    _description = "Scraper Test"

    url = fields.Char(
        "Url",
        required=True,
        help="Url",
        default="http://localhost:8069/ai_doc/static/html/index.html",
    )
    
    def _get_result(self, message = None):
        if not message:
            res = {
                'type': 'ir.actions.act_window',
                'name': "Scraper Test",
                'target': 'new',
                'view_mode': 'form',
                'res_model': 'scrap.wizard',
                'res_id': self.id,
            }
        if message:
            res = {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'type': 'info',
                    'title': 'Result',
                    'message': message
                },
            }
        
        return res
        
    def action_test_crawl4ai(self):
        msg = "Ok!"
        try:
            text = self.url
            test_crawl4ai(text)
        except Exception as e:
            _logger.error(e);
            err = str(e)
            msg = "Error! " + err[:75] + '..' * (len(err) > 75)

        return self._get_result(msg)


    def action_test_playwright(self):
        msg = "Ok!"
        try:
            text = self.url
            test_playwright(text)
        except Exception as e:
            _logger.error(e);
            err = str(e)
            msg = "Error! " + err[:75] + '..' * (len(err) > 75)

        return self._get_result(msg)

    def action_test_selenium(self):
        msg = "Ok!"
        try:
            text = self.url
            test_selenium(text)
        except Exception as e:
            _logger.error(e);
            err = str(e)
            msg = "Error! " + err[:75] + '..' * (len(err) > 75)

        return self._get_result(msg)
