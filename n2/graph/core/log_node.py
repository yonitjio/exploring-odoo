import logging
import json
import inspect
from types import GeneratorType
from itertools import islice, tee
import pandas as pd

from odoo.tools import json_default
from .base_node import BaseNode

_logger = logging.getLogger(__name__)


# --- Preview logic ---

def _preview_generator(gen, preview_chunks=3, preview_rows=5):
    """Preview only the first `preview_chunks` of a generator/lazy iterable without consuming it fully."""
    if callable(gen) and not inspect.isgenerator(gen):
        gen = gen()  # auto-start generator function

    try:
        gen, gen_copy = tee(iter(gen))
    except Exception as e:
        return {
            "_type": "generator_preview",
            "chunks_shown": 0,
            "preview": [{"error": str(e)}],
            "note": "Failed to iterate generator"
        }, iter([])

    preview_list = []
    for i, item in enumerate(islice(gen_copy, preview_chunks)):
        if isinstance(item, pd.DataFrame):
            preview_list.append({
                "chunk": i + 1,
                "rows": len(item),
                "columns": list(item.columns),
                "sample": item.head(preview_rows).to_dict(orient="records") if not item.empty else []
            })
        else:
            preview_list.append({
                "chunk": i + 1,
                "type": str(type(item)),
                "repr": str(item)[:500]
            })

    if not preview_list:
        preview_list.append({"note": "Generator valid but no items yielded"})

    return {
        "_type": "generator_preview",
        "chunks_shown": len(preview_list),
        "preview": preview_list,
    }, gen  # original iterator


def _is_previewable(obj):
    """Return True if obj is a lazy data source (has iter_batches method)."""
    return callable(getattr(obj, "iter_batches", None))


def _replace_generators(obj, preview_chunks=3, preview_rows=5):
    """Recursively replace generators and lazy data sources with preview dicts."""
    if inspect.isgenerator(obj) or isinstance(obj, GeneratorType):
        preview, _ = _preview_generator(obj, preview_chunks, preview_rows)
        return preview

    elif _is_previewable(obj):
        try:
            preview, _ = _preview_generator(obj.iter_batches(), preview_chunks, preview_rows)
            return {
                "_type": f"{obj.__class__.__name__}_preview",
                "chunks_shown": preview["chunks_shown"],
                "preview": preview["preview"],
            }
        except Exception as e:
            return {"_type": f"{obj.__class__.__name__}_preview", "error": str(e)}

    elif isinstance(obj, dict):
        return {k: _replace_generators(v, preview_chunks, preview_rows) for k, v in obj.items()}

    elif isinstance(obj, (list, tuple, set)):
        return [_replace_generators(v, preview_chunks, preview_rows) for v in obj]

    else:
        return obj


def dump_log(obj, preview_chunks=3, preview_rows=5):
    """Safely dump objects with generator/lazy source preview."""
    processed = _replace_generators(obj, preview_chunks, preview_rows)
    return json.dumps(processed, indent=4, separators=(",", ":"), default=json_default)


# --- LogNode ---

class LogNode(BaseNode):
    """Node that logs params safely, previewing generators and lazy data sources."""

    def _process(self, params):
        tag = self.definition.get("tag", "LOG")

        log_msg = dump_log(params)
        _logger.info("%s: %s", tag, log_msg)

        if self.env.context.get("is_debug"):
            try:
                debug_msg = "Context:  \n```\n" + dump_log(self.env.context) + "\n```"
                _logger.info("%s-debug: %s", tag, debug_msg)
            except Exception:
                _logger.exception("Unable to log debug message")

        return params
