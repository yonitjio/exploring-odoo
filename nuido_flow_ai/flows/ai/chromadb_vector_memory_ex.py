# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging
_logger = logging.getLogger(__name__)

from chromadb import HttpClient, PersistentClient

from autogen_ext.memory.chromadb import ChromaDBVectorMemory, PersistentChromaDBVectorMemoryConfig, HttpChromaDBVectorMemoryConfig

class ChromaDBVectorMemoryEx(ChromaDBVectorMemory):
    def _ensure_initialized(self) -> None:
        """Ensure ChromaDB client and collection are initialized."""
        if self._client is None:
            try:
                from chromadb.config import Settings

                settings = Settings(
                    allow_reset=self._config.allow_reset,
                    anonymized_telemetry=False
                )

                if isinstance(self._config, PersistentChromaDBVectorMemoryConfig):
                    self._client = PersistentClient(
                        path=self._config.persistence_path,
                        settings=settings,
                        tenant=self._config.tenant,
                        database=self._config.database,
                    )
                elif isinstance(self._config, HttpChromaDBVectorMemoryConfig):
                    self._client = HttpClient(
                        host=self._config.host,
                        port=self._config.port,
                        ssl=self._config.ssl,
                        headers=self._config.headers,
                        settings=settings,
                        tenant=self._config.tenant,
                        database=self._config.database,
                    )
                else:
                    raise ValueError(f"Unsupported config type: {type(self._config)}")
            except Exception as e:
                _logger.error(f"Failed to initialize ChromaDB client: {e}")
                raise

        if self._collection is None:
            try:
                # Create embedding function
                embedding_function = self._create_embedding_function()

                # Create or get collection with embedding function
                self._collection = self._client.get_or_create_collection(
                    name=self._config.collection_name,
                    metadata={"distance_metric": self._config.distance_metric},
                    embedding_function=embedding_function,
                )
            except Exception as e:
                _logger.error(f"Failed to get/create collection: {e}")
                raise

    async def remove(self, where) -> None:
        self._ensure_initialized()
        if self._collection is None:
            raise RuntimeError("Failed to initialize ChromaDB")

        try:
            # Remove from ChromaDB
            self._collection.delete(where=where)

        except Exception as e:
            _logger.error(f"Failed to add content to ChromaDB: {e}")
            raise
