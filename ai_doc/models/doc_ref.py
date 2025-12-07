# -*- coding: utf-8 -*-
import logging
_logger = logging.getLogger(__name__)

from odoo import models, fields, api

from ..ai import embedding_utils, crawl_utils

class DocRef(models.Model):
    _name = "doc.ref"
    _description = "Odoo Documentation Links"
    _rec_name = "title"


    title = fields.Char("Title", required=True)
    link = fields.Char("Link", required=True)
    extracted_text = fields.Text("Extracted Text")
    is_processed = fields.Boolean("Processed", default=False)

    def _process_link(self, rec):
        title, content = crawl_utils.crawl_doc_ref(rec.link)
        rec.extracted_text = content
        embedding_utils.save_document(id=rec.id, title=title, content=content, link=rec.link)

    def action_process_links(self):
        for rec in self.browse(self.env.context["active_ids"]):
            self._process_link(rec)
            rec.is_processed = True

    def _reset_link(self, rec):
        embedding_utils.remove_document(id=rec.id)

    def action_reset_links(self):
        for rec in self.browse(self.env.context["active_ids"]):
            self._reset_link(rec)
            rec.is_processed = False

    @api.onchange("title", "link")
    def _new_or_updated(self):
        self.update({"is_processed": False})

    def unlink(self):
        for rec in self:
            if rec.is_processed:
                self._reset_link(rec)

        return super().unlink()
