import logging

_logger = logging.getLogger(__name__)

from textwrap import dedent

from odoo import _, models, fields
from ..models.agents.kb_utils import get_related_articles, get_related_qas

class KnowledgeBaseSearch(models.TransientModel):
    _name = 'mail.bot.advai.knowledge.base.search'
    _description = "Search knowledge base."

    search_text = fields.Char("Search Text", required=True, help="Text to be searched.")
    result_text = fields.Text("Results")

    def action_reset_entries(self):
        self.search_text = ""
        self.result_text = ""

        return {
            'name': _('Search Knowledge Base'),
            'type': 'ir.actions.act_window',
            'res_model': 'mail.bot.advai.knowledge.base.search',
            'view_type': 'form',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'new',
        }

    def action_search_knowledge_base(self):
        text = self.search_text
        articles = get_related_articles(text)
        qas = get_related_qas(text)

        res = ""
        if articles and len(articles) > 0:
            txt = "ARTICLES-------------------------\n"
            for idx, article in enumerate(articles, start=1):
                kb = self.env["mail.bot.advai.knowledge.base"].browse(article)
                content = f"title: {kb.title}\ncontent:{kb.content}"
                txt += content + "\n"
                if idx < len(articles):
                    txt += "---------------------------------\n"

            res += txt

        res = res + "\n"
        if qas and len(qas) > 0:
            txt = "QAS------------------------------\n"
            for qa in qas:
                kb = self.env["mail.bot.advai.knowledge.base"].browse(qa)
                content = f"question: {kb.title}\nsql:{kb.content}"
                txt += content + "\n"
                txt += "---------------------------------\n"

            res += txt

        self.result_text = res

        return {
            'name': _('Search Knowledge Base'),
            'type': 'ir.actions.act_window',
            'res_model': 'mail.bot.advai.knowledge.base.search',
            'view_type': 'form',
            'view_mode': 'form',
            'res_id': self.id,
            'target': 'new',
        }
