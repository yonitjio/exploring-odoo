import datetime

from autogen import filter_config

AI_API_KEY = "__localai__"
AI_BASE_URL = "http://localhost:8080/v1"

EMBEDDING_MODEL = "nomic-embedding"
LLM_MODEL = "hermes"

DEFAULT_AUTOGEN_CONFIG_LIST = [
    {
        "model": LLM_MODEL,
        "base_url": AI_BASE_URL,
        "api_key": AI_API_KEY,
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

DEFAULT_SERVER_DATE_FORMAT = "%Y-%m-%d"
DEFAULT_SERVER_TIME_FORMAT = "%H:%M:%S"
DEFAULT_SERVER_DATETIME_FORMAT = "%s %s" % (
    DEFAULT_SERVER_DATE_FORMAT,
    DEFAULT_SERVER_TIME_FORMAT)

DATE_LENGTH = len(datetime.date.today().strftime(DEFAULT_SERVER_DATE_FORMAT))
