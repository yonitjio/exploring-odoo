# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import os
import asyncio

from odoo.tools import config

from chromadb.utils import embedding_functions
from chromadb.config import Settings

from autogen_core.memory import MemoryContent
from autogen_ext.memory.chromadb import PersistentChromaDBVectorMemoryConfig, CustomEmbeddingFunctionConfig

from .chromadb_vector_memory_ex import ChromaDBVectorMemoryEx
from .utils import run_async_function

os.environ["CHROMA_OPENAI_API_KEY"] = "__NOT_USED__"

def create_memory(collection_name):
    vector_db_embedding_model = config["vector_db_embedding_model"]
    vector_db_dir = config["vector_db_dir"]
    vector_db_url = config["vector_db_url"]
    memory = ChromaDBVectorMemoryEx(
        config=PersistentChromaDBVectorMemoryConfig(
            collection_name=collection_name,
            persistence_path=vector_db_dir,
            embedding_function_config=CustomEmbeddingFunctionConfig(
                function=embedding_functions.OpenAIEmbeddingFunction,
                params= {
                    "api_base": vector_db_url,
                    "model_name": vector_db_embedding_model,
                }
            )
        )
    )

    return memory

async def _add_memory(memory, content, mime_type, metadata):
    await memory.add(
        MemoryContent(
            content=content,
            mime_type=mime_type,
            metadata=metadata,
        )
    )

def add_memory_content(memory, content, mime_type, metadata):
    run_async_function(_add_memory, memory, content, mime_type, metadata)

async def _remove_memory(memory, where):
    await memory.remove(where)

def remove_memory_content(memory, where):
    run_async_function(_remove_memory, memory, where)

async def _close_memory(memory):
    await memory.close()

def close_memory(memory):
    run_async_function(_close_memory, memory)

