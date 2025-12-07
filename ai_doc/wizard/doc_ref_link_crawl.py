import logging

_logger = logging.getLogger(__name__)

import re
from odoo import _, models, fields

from ..ai.crawl_utils import crawl_doc_links


class CrawlDocLinks(models.TransientModel):
    _name = "doc.ref.link.crawl"
    _description = "Populate the documentation links"

    doc_url = fields.Char(
        "Documentation Url",
        required=True,
        help="Documentation Url",
        default="http://localhost:8069/ai_doc/static/html/index.html",
    )

    def action_populate_links(self):
        text = self.doc_url
        res = crawl_doc_links(text)
        for r in res:
            self.env["doc.ref"].create(r)

        return True
