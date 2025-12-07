import logging
_logger = logging.getLogger(__name__)

from typing import Annotated, Any

from pydantic import Field

from semantic_kernel.functions.kernel_function_decorator import kernel_function
from semantic_kernel.kernel_pydantic import KernelBaseModel
from semantic_kernel.memory.semantic_text_memory_base import SemanticTextMemoryBase

from odoo.api import Environment

from . import consts

class OdooDocumentationPlugin(KernelBaseModel):
    env: Environment
    memory: SemanticTextMemoryBase
    embeddings_kwargs: dict[str, Any] = Field(default_factory=dict)

    def __init__(self, env: Environment, memory: SemanticTextMemoryBase, embeddings_kwargs: dict[str, Any] = {}) -> None:
        super().__init__(env = env, memory = memory, embeddings_kwargs = embeddings_kwargs)

    @kernel_function(
        description="Search Odoo documentation.",
        name="search",
    )
    async def search(
        self,
        topic: Annotated[str, "The information to retrieve"]
    ) -> str:
        try:
            results = await self.memory.search(
                collection=consts.ODOO_DOC_COLLECTION,
                query=topic,
                limit=consts.ODOO_DOC_DEFAULT_LIMIT,
                min_relevance_score=consts.ODOO_DOC_DEFAULT_RELEVANCE,
                with_embeddings=True
            )

            # _logger.info(f"Memory found: {consts.ODOO_DOC_COLLECTION}:\n{results[0].text}")
        except Exception as e:
            _logger.error(f"Error: {e}")
            results = None
        if results is None or len(results) == 0:
            _logger.info(f"Memory not found in collection: {consts.ODOO_DOC_COLLECTION}")
            return f"There's no documentation for the topic: '{topic}'."

        rec = self.env["doc.ref"].browse(int(results[0].id))

        title = rec["title"]
        summary = results[0].text
        content = rec['extracted_text']
        res = f"#{title} #Summary\n{summary}\n\n#Content\n{content}"
        return res
