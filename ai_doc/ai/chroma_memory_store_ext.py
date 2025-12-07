import logging
from typing import Any, Optional

from semantic_kernel.utils.experimental_decorator import experimental_class

import chromadb
import chromadb.config

logger: logging.Logger = logging.getLogger(__name__)

from semantic_kernel.connectors.memory.chroma.chroma_memory_store import ChromaMemoryStore

@experimental_class
class ChromaMemoryStoreExt(ChromaMemoryStore):
    def __init__(
        self,
        persist_directory: str | None = None,
        client_settings: Optional["chromadb.config.Settings"] = None,
        **kwargs: Any,
    ) -> None:
        if client_settings:
            self._client_settings = client_settings
        else:
            self._client_settings = chromadb.config.Settings()

        self._client_settings.anonymized_telemetry=False

        if persist_directory is not None:
            self._client = chromadb.PersistentClient(path=persist_directory, settings=self._client_settings)
        else:
            self._client = chromadb.PersistentClient(settings=self._client_settings)

        self._persist_directory = persist_directory
        self._default_query_includes = ["embeddings", "metadatas", "documents"]

    async def get_collection(self, collection_name: str):
        try:
            col = self._client.get_or_create_collection(name=collection_name)
            return col
        except ValueError:
            return None
