# -*- coding: utf-8 -*-

import hashlib
import logging

_logger = logging.getLogger(__name__)

from odoo.tools import config

from chromadb.config import Settings
import chromadb.utils.embedding_functions as embedding_functions

from autogen.agentchat.contrib.vectordb.chromadb import ChromaVectorDB
from autogen.agentchat.contrib.vectordb.utils import chroma_results_to_query_results
from autogen.retrieve_utils import split_text_to_chunks
from autogen.agentchat.contrib.vectordb.base import Document
from autogen import UserProxyAgent

from .sentence_analyst_agent import SentenceAnalystAgent
from .article_analyst_agent import ArticleAnalystAgent
from .consts import DEFAULT_AUTOGEN_LLM_CONFIG, QA_COLLECTION_NAME, ARTICLE_COLLECTION_NAME, HASH_LENGTH, BASE_URL, API_KEY, EMBEDDING_MODEL

def get_vector_db():
    embedding_function = embedding_functions.OpenAIEmbeddingFunction(
        api_key=API_KEY,
        api_base=BASE_URL,
        model_name=EMBEDDING_MODEL,
    )

    vector_db = ChromaVectorDB(
        path=config["data_dir"],
        embedding_function=embedding_function,
        settings=Settings(anonymized_telemetry=False),
    )

    vector_db.create_collection(QA_COLLECTION_NAME)
    vector_db.create_collection(ARTICLE_COLLECTION_NAME)

    return vector_db

def summarize_article(text):
    user_proxy = UserProxyAgent(
        "summarize_article_initiator",
        human_input_mode="NEVER",
        is_termination_msg=lambda message: True,
        code_execution_config=False,
    )

    analyst = ArticleAnalystAgent(
        name="article_analyst",
        llm_config=DEFAULT_AUTOGEN_LLM_CONFIG
    )

    result = user_proxy.initiate_chat(analyst, message=text)
    return result.summary

def text_to_topics(text):
    user_proxy = UserProxyAgent(
        "text_to_topic_initiator",
        human_input_mode="NEVER",
        is_termination_msg=lambda message: True,
        code_execution_config=False,
    )

    analyst = SentenceAnalystAgent(
        name="sentence_analyst",
        llm_config=DEFAULT_AUTOGEN_LLM_CONFIG
    )

    result = user_proxy.initiate_chat(analyst, message=text)
    return result.summary

def add_to_collection(collection_name, text, source):
    vdb = get_vector_db()

    # changes create new hash?, might as well re-create all
    vdb.delete_docs(
        ids=None, collection_name=collection_name, where={"source": source}
    )

    chunks = split_text_to_chunks(
        text, max_tokens=1640, must_break_at_empty_line=False
    )
    metadata = [{"source": source}] * len(chunks)

    chunk_ids = [
        hashlib.blake2b(f"{source}".encode("utf-8") + chunk.encode("utf-8")).hexdigest()[:HASH_LENGTH]
        for chunk in chunks
    ]
    chunk_ids_set = set(chunk_ids)
    chunk_ids_set_idx = [
        chunk_ids.index(hash_value) for hash_value in chunk_ids_set
    ]

    all_docs_ids = set(
        [
            doc["id"]
            for doc in vdb.get_docs_by_ids(
                ids=None, collection_name=collection_name
            )
        ]
    )

    docs = [
        Document(id=chunk_ids[idx], content=chunks[idx], metadata=metadata[idx])
        for idx in chunk_ids_set_idx
        if chunk_ids[idx] not in all_docs_ids
    ]

    vdb.insert_docs(docs=docs, collection_name=collection_name, upsert=True)

def add_qa(text, source):
    topics = text_to_topics(text)
    add_to_collection(collection_name=QA_COLLECTION_NAME, text=topics, source=source)

def add_article(text, source):
    summary = summarize_article(text)
    add_to_collection(collection_name=ARTICLE_COLLECTION_NAME, text=summary, source=source)

def remove_from_collection(collection_name, source):
    vdb = get_vector_db()
    vdb.delete_docs(
        ids=None,
        collection_name=collection_name,
        where={"source": source},
    )

def remove_qa(source):
    remove_from_collection(QA_COLLECTION_NAME, source=source)

def remove_article(source):
    remove_from_collection(ARTICLE_COLLECTION_NAME, source=source)

def get_related_documents(collection_name, text):
    vdb = get_vector_db()

    topics = text_to_topics(text=text)

    collection = vdb.client.get_collection(collection_name, embedding_function=vdb.embedding_function)
    results = collection.query(
        query_texts=[topics],
        n_results=3
    )

    results["contents"] = results.pop("documents")
    results = chroma_results_to_query_results(results, "distances")
    results = sorted(results[0], key=lambda tup: tup[1])

    docs = []
    for res in results:
        doc = res[0]
        kb_id = doc.get("metadata").get("source")
        if kb_id not in docs:
            docs.append(kb_id)

    return docs

def get_related_qas(text):
    return get_related_documents(QA_COLLECTION_NAME, text)

def get_related_articles(text):
    return get_related_documents(ARTICLE_COLLECTION_NAME, text)
