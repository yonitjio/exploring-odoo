# -*- coding: utf-8 -*-

from . import controllers
from . import models
from . import wizard

from .models.agents.kb_utils import add_qa, add_article

def process_initial_knowledge_base(env):
    kbs = env["mail.bot.advai.knowledge.base"].search([])
    for rec in kbs:
        if rec.kb_type == "article":
            text = f"Title: {rec.title}\nContent:\n{rec.content}"
            add_article(text, rec.id)
        else:
            text = rec.title
            add_qa(text, rec.id)

        rec.is_processed = True