import os
import os.path
import logging
_logger = logging.getLogger(__name__)

import json

from openai import AsyncOpenAI
from semantic_kernel.connectors.ai.open_ai.services.open_ai_text_embedding import OpenAITextEmbedding
from semantic_kernel.connectors.memory.chroma.chroma_memory_store import ChromaMemoryStore
from semantic_kernel.memory.semantic_text_memory import SemanticTextMemory

from .chroma_memory_store_ext import ChromaMemoryStoreExt
from . import async_utils
from . import consts
from . import summarizer


def init_store(store: ChromaMemoryStore):
    async def _init_chroma_db(st: ChromaMemoryStore):
        await st.get_collection(consts.ODOO_DOC_COLLECTION)

    async_utils.run_async_function(_init_chroma_db, store)

def create_memory():
    store = ChromaMemoryStoreExt(consts.CHROMA_DB_DIR)
    init_store(store)

    embedding_client = AsyncOpenAI(
        api_key=consts.API_KEY,
        base_url=consts.BASE_URL,
        default_headers=consts.DEFAULT_HEADER
    )
    embedding_gen = OpenAITextEmbedding(
        ai_model_id=consts.EMBEDDING_MODEL,
        service_id=consts.EMBEDDING_SERVICE_ID,
        async_client=embedding_client
    )
    memory = SemanticTextMemory(storage=store, embeddings_generator=embedding_gen)
    return store, memory


async def save_document_async(store:ChromaMemoryStoreExt, memory:SemanticTextMemory, id, title, content, link):
    sum = summarizer.Summarizer()
    text = await sum.summarize_async(content)
    text = text + os.linesep + "Full documentation: " + link
    await memory.save_information(
        collection=consts.ODOO_DOC_COLLECTION,
        id=str(id),
        text=text,
        additional_metadata=json.dumps({
            "title": title
        })
    )

def save_document(id, title, content, link):
    store, memory = create_memory()
    async_utils.run_async_function(save_document_async, store, memory, id, title, content, link)

async def remove_document_async(store:ChromaMemoryStoreExt, memory:SemanticTextMemory, id):
    col = await store.get_collection(consts.ODOO_DOC_COLLECTION)
    col.delete([str(id)])

def remove_document(id):
    store, memory = create_memory()
    async_utils.run_async_function(remove_document_async, store, memory, id)
