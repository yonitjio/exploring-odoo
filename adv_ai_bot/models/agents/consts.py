# -*- coding: utf-8 -*-
from autogen import filter_config

API_KEY = "__localai__"
BASE_URL = "http://localhost:8080/v1"

EMBEDDING_MODEL = "nomic-embedding"
LLM_MODEL = "hermes"

DEFAULT_AUTOGEN_CONFIG_LIST = [
    {
        "model": LLM_MODEL,
        "base_url": BASE_URL,
        "api_key": API_KEY,
    },
]

DEFAULT_AUTOGEN_LLM_CONFIG = {
    "config_list": filter_config(DEFAULT_AUTOGEN_CONFIG_LIST, {"model": ["hermes"]}),
    "cache_seed": None,
}

QA_COLLECTION_NAME = "qa_knowledge_base"
ARTICLE_COLLECTION_NAME = "article_knowledge_base"

KB_TOPICS = [
    "Sales",
    "Purchases",
    "Products",
    "Accounting",
    "Invoices",
    "Customers",
    "Suppliers",
    ]

HASH_LENGTH = 15