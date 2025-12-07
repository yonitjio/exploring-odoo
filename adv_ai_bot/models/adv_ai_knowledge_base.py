# -*- coding: utf-8 -*-

import logging

_logger = logging.getLogger(__name__)

from odoo import models, fields, api


from .agents.kb_utils import remove_article, remove_qa, add_article, add_qa

class AdvAiBotKnowledgeBase(models.Model):
    _name = "mail.bot.advai.knowledge.base"
    _description = "Knowledge base for Adv Ai Bot"
    _rec_name = "title"


    title = fields.Char("Title")
    content = fields.Text("Content")
    is_processed = fields.Boolean("Processed", default=False)
    truncated_content = fields.Char(compute="_compute_truncated_content", store=False)
    kb_type = fields.Selection(
        [("qa", "Q & A"), ("article", "Article")],
        string="KB Type",
        required=True,
        default="qa",
    )

    def init(self):
        super().init()

    @api.depends("content")
    def _compute_truncated_content(self):
        for rec in self:
            if rec.content:
                if len(rec.content) > 60:
                    rec["truncated_content"] = f"{rec.content[:60]}..."
                else:
                    rec["truncated_content"] = rec.content
            else:
                rec["truncated_content"] = False

    def _process_knowledge_base(self, rec):
        if rec.kb_type == "article":
            text = f"Title: {rec.title}\nContent:\n{rec.content}"
            add_article(text, rec.id)
        else:
            text = rec.title
            add_qa(text, rec.id)

    def action_process_knowledge_base(self):
        for rec in self.browse(self.env.context["active_ids"]):
            self._process_knowledge_base(rec)
            rec.is_processed = True

    @api.onchange("title", "content")
    def _new_or_updated(self):
        self.update({"is_processed": False})

    def unlink(self):
        for rec in self:
            if rec.kb_type == "article":
                remove_article(rec.id)
            else:
                remove_qa(rec.id)
        return super().unlink()

