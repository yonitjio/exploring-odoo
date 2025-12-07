# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import asyncio

from odoo.tools import safe_eval
from odoo.tools.rendering_tools import parse_inline_template

def process_template(template_txt, variables):
    template = parse_inline_template(str(template_txt))
    result = ""
    renderer = []
    for string, expression, default in template:
        renderer.append(string)
        if expression:
            try:
                value = safe_eval.safe_eval(expression, variables) or default
            except KeyError:
                value = default
            renderer.append(str(value))
    result = ''.join(renderer)
    return result

def run_async_function(func_to_run, *args):
    new_loop = asyncio.new_event_loop()
    data = None
    try:
        asyncio.set_event_loop(new_loop)
        data = new_loop.run_until_complete(func_to_run(*args))
        tasks = asyncio.all_tasks(new_loop)
        while len([t for t in tasks if not (t.done() or t.cancelled())]) > 0:
            for t in [t for t in tasks if not (t.done() or t.cancelled())]:
                new_loop.run_until_complete(t)
            tasks = asyncio.all_tasks(new_loop)
    finally:
        new_loop.close()

    return data
