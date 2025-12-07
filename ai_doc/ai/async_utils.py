import asyncio

def run_async_function(func_to_run, *args):
    new_loop = asyncio.new_event_loop()
    try:
        asyncio.set_event_loop(new_loop)
        return new_loop.run_until_complete(func_to_run(*args))
    finally:
        new_loop.close()
