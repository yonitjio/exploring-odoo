import os
import sys
import signal
import resource
import argparse
import logging
import asyncio
from multiprocessing import Process, get_context

from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from playwright.async_api import async_playwright
from selenium import webdriver

_logger = logging.getLogger(__name__)

def we_are_frozen():
    # All of the modules are built-in to the interpreter, e.g., by py2exe
    return hasattr(sys, "frozen")

def module_path():
    if we_are_frozen():
        return os.path.dirname(sys.executable)
    return os.path.dirname(__file__)

CWD = module_path()
TEST_WEBSITE = "http://example.com"

# region utils
def exit():
    loop = asyncio.get_event_loop()
    print("Stop")
    loop.stop()

def ask_exit():
    for task in asyncio.Task.all_tasks():
        task.cancel()
    asyncio.ensure_future(exit())

def run_async_function(func_to_run, *args):
    new_loop = asyncio.new_event_loop()
    try:
        for sig in (signal.SIGINT, signal.SIGTERM):
            new_loop.add_signal_handler(sig, ask_exit)
        asyncio.set_event_loop(new_loop)
        return new_loop.run_until_complete(func_to_run(*args))
    finally:
        new_loop.close()
# endregion

# region base tests
async def test_crawl4ai_async(ref_url):
    browser_config = BrowserConfig(verbose=True)
    run_config = CrawlerRunConfig()

    crawler = AsyncWebCrawler(config=browser_config)
    await crawler.start()
    await crawler.arun(url=ref_url, config=run_config )
    await crawler.close()

def test_crawl4ai(ref_url):
    try:
        run_async_function(test_crawl4ai_async, ref_url)
    except Exception as e:
        err = str(e)
        print("Error! " + err[:75] + '..' * (len(err) > 75))

async def test_playwright_async(url):
    async with async_playwright() as playwright:
        await asyncio.sleep(0)
        chromium = playwright.chromium
        browser = await chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url)
        title = await page.title()
        print(title)
        await browser.close()

def test_playwright(ref_url):
    try:
        run_async_function(test_playwright_async, ref_url)
    except Exception as e:
        err = str(e)
        print("Error! " + err[:75] + '..' * (len(err) > 75))

async def test_selenium_async(url):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options)
    driver.get(url)
    print(driver.title)
    driver.quit()

def test_selenium(ref_url):
    try:
        run_async_function(test_selenium_async, ref_url)
    except Exception as e:
        err = str(e)
        print("Error! " + err[:75] + '..' * (len(err) > 75))
# endregion

# region subprocess
async def test_playwright_subprocess(ref_url):
    proc = await asyncio.create_subprocess_exec(
        sys.executable, '-c', f"from test import test_playwright; test_playwright('{ref_url}')",
        stdout=asyncio.subprocess.PIPE, cwd=CWD)

    data = await proc.stdout.readline()
    line = data.decode('utf-8').rstrip()

    await proc.wait()
    return line

async def test_selenium_subprocess(ref_url):
    proc = await asyncio.create_subprocess_exec(
        sys.executable, '-c', f"from test import test_selenium; test_selenium('{ref_url}')",
        stdout=asyncio.subprocess.PIPE, cwd=CWD)

    data = await proc.stdout.readline()
    line = data.decode('utf-8').rstrip()

    await proc.wait()
    try:
        await asyncio.wait(0)
    except:
        pass
    return line

async def test_chromium_subprocess(ref_url):
    try:
        exec = "/home/yoni/.cache/ms-playwright/chromium_headless_shell-1155/chrome-linux/headless_shell"
        proc = await asyncio.create_subprocess_exec(
            exec,
            "--single-process",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-gpu-compositing",
            "--headless",
            "--mute-audio",
            "--dump-dom",
            ref_url,
            stdout=asyncio.subprocess.PIPE, cwd=CWD)

        data = await proc.stdout.readline()
        line = data.decode('utf-8').rstrip()

        await proc.wait()
        if line == '':
            return "No output."
        return line
    except:
        return "Error."
# endregion

# region subprocess with unlimited resource
async def test_playwright_subprocess_with_unlimited_limit(ref_url):
    rlimit = resource.RLIMIT_AS
    soft, hard = resource.getrlimit(rlimit)
    resource.prlimit(0, rlimit, (resource.RLIM_INFINITY, resource.RLIM_INFINITY))

    proc = await asyncio.create_subprocess_exec(
        sys.executable, '-c', f"from test import test_playwright; test_playwright('{ref_url}')",
        stdout=asyncio.subprocess.PIPE, cwd=CWD)

    data = await proc.stdout.readline()
    line = data.decode('utf-8').rstrip()

    await proc.wait()
    return line

def test_playwright_subprocess_with_unlimited_limit_sync(ref_url):
    line = run_async_function(test_playwright_subprocess_with_unlimited_limit, ref_url)
    print(line)

async def test_playwright_sub_subprocess(ref_url):
    proc = await asyncio.create_subprocess_exec(
        sys.executable, '-c', f"from test import test_playwright_subprocess_with_unlimited_limit_sync; test_playwright_subprocess_with_unlimited_limit_sync('{ref_url}')",
        stdout=asyncio.subprocess.PIPE, cwd=CWD)

    data = await proc.stdout.readline()
    line = data.decode('utf-8').rstrip()

    await proc.wait()
    return line

async def test_selenium_subprocess_with_unlimited_limit(ref_url):
    rlimit = resource.RLIMIT_AS
    soft, hard = resource.getrlimit(rlimit)
    resource.prlimit(0, rlimit, (resource.RLIM_INFINITY, resource.RLIM_INFINITY))

    proc = await asyncio.create_subprocess_exec(
        sys.executable, '-c', f"from test import test_selenium; test_selenium('{ref_url}')",
        stdout=asyncio.subprocess.PIPE, cwd=CWD)

    data = await proc.stdout.readline()
    line = data.decode('utf-8').rstrip()

    await proc.wait()
    return line

def test_selenium_subprocess_with_unlimited_limit_sync(ref_url):
    line = run_async_function(test_selenium_subprocess_with_unlimited_limit, ref_url)
    print(line)

async def test_selenium_sub_subprocess(ref_url):
    proc = await asyncio.create_subprocess_exec(
        sys.executable, '-c', f"from test import test_selenium_subprocess_with_unlimited_limit_sync; test_selenium_subprocess_with_unlimited_limit_sync('{ref_url}')",
        stdout=asyncio.subprocess.PIPE, cwd=CWD)

    data = await proc.stdout.readline()
    line = data.decode('utf-8').rstrip()

    await proc.wait()
    return line

# endregion

# region multiprocess
def test_playwright_with_unlimited_limit_multiprocess_child(q, ref_url):
    rlimit = resource.RLIMIT_AS
    soft, hard = resource.getrlimit(rlimit)
    resource.prlimit(0, rlimit, (resource.RLIM_INFINITY, resource.RLIM_INFINITY))

    line = run_async_function(test_playwright_subprocess, ref_url)

    q.put(line)

def test_playwright_with_unlimited_limit_multiprocess_parent(ref_url):
    ctx = get_context('spawn')
    q = ctx.Queue()

    p = Process(target=test_playwright_with_unlimited_limit_multiprocess_child, args=(q, ref_url))
    p.start()
    print(q.get())
    p.join()

def test_selenium_with_unlimited_limit_multiprocess_child(q, ref_url):
    rlimit = resource.RLIMIT_AS
    soft, hard = resource.getrlimit(rlimit)
    resource.prlimit(0, rlimit, (resource.RLIM_INFINITY, resource.RLIM_INFINITY))

    line = run_async_function(test_selenium_subprocess, ref_url)

    q.put(line)

def test_selenium_with_unlimited_limit_multiprocess_parent(ref_url):
    ctx = get_context('spawn')
    q = ctx.Queue()

    p = Process(target=test_selenium_with_unlimited_limit_multiprocess_child, args=(q, ref_url))
    p.start()
    print(q.get())
    p.join()
# endregion

def run_tests():
    print("----------crawl4ai")
    test_crawl4ai(TEST_WEBSITE)

    print("----------playwright")
    test_playwright(TEST_WEBSITE)

    print("----------selenium")
    test_selenium(TEST_WEBSITE)

def run_tests_subprocess():
    print("----------Playwright inside sub process")
    line = run_async_function(test_playwright_subprocess, TEST_WEBSITE)
    print(line)

    print("----------Selenium inside sub process")
    line = run_async_function(test_selenium_subprocess, TEST_WEBSITE)
    print(line)

    print("----------Chromium inside sub process")
    line = run_async_function(test_chromium_subprocess, TEST_WEBSITE)
    print(line)

def run_tests_subprocess_with_limit(limit):
    rlimit = resource.RLIMIT_AS
    soft, hard = resource.getrlimit(rlimit)
    resource.setrlimit(rlimit, (limit, hard))

    soft, hard = resource.getrlimit(rlimit)
    print("Limit before: ", soft, " : ", hard)

    run_tests_subprocess()

    soft, hard = resource.getrlimit(rlimit)
    print("Limit after: ", soft, " : ", hard)

    resource.setrlimit(rlimit, (soft, hard))

def run_tests_with_unlimited_limit(limit):
    rlimit = resource.RLIMIT_AS
    soft, hard = resource.getrlimit(rlimit)

    print("----------Playwright inside sub process")
    resource.setrlimit(rlimit, (limit, hard))
    soft, hard = resource.getrlimit(rlimit)

    print("Limit before: ", soft, " : ", hard)
    line = run_async_function(test_playwright_subprocess_with_unlimited_limit, TEST_WEBSITE)
    print(line)

    soft, hard = resource.getrlimit(rlimit)
    print("Limit after: ", soft, " : ", hard)

    print("----------Playwright inside sub sub process")
    resource.setrlimit(rlimit, (limit, hard))
    soft, hard = resource.getrlimit(rlimit)

    print("Limit before: ", soft, " : ", hard)
    line = run_async_function(test_playwright_sub_subprocess, TEST_WEBSITE)
    print(line)

    soft, hard = resource.getrlimit(rlimit)
    print("Limit after: ", soft, " : ", hard)

    print("----------Playright inside multi process")
    resource.setrlimit(rlimit, (limit, hard))
    soft, hard = resource.getrlimit(rlimit)

    print("Limit before: ", soft, " : ", hard)
    test_playwright_with_unlimited_limit_multiprocess_parent(TEST_WEBSITE)

    soft, hard = resource.getrlimit(rlimit)
    print("Limit after: ", soft, " : ", hard)

    print("----------Selenium inside sub process")
    resource.setrlimit(rlimit, (limit, hard))
    soft, hard = resource.getrlimit(rlimit)

    print("Limit before: ", soft, " : ", hard)
    line = run_async_function(test_selenium_subprocess_with_unlimited_limit, TEST_WEBSITE)
    print(line)

    soft, hard = resource.getrlimit(rlimit)
    print("Limit after: ", soft, " : ", hard)

    print("----------Selenium inside sub sub process")
    resource.setrlimit(rlimit, (limit, hard))
    soft, hard = resource.getrlimit(rlimit)

    print("Limit before: ", soft, " : ", hard)
    line = run_async_function(test_selenium_sub_subprocess, TEST_WEBSITE)
    print(line)

    soft, hard = resource.getrlimit(rlimit)
    print("Limit after: ", soft, " : ", hard)

    print("----------Selenium inside multi process")
    resource.setrlimit(rlimit, (limit, hard))
    soft, hard = resource.getrlimit(rlimit)

    print("Limit before: ", soft, " : ", hard)
    test_playwright_with_unlimited_limit_multiprocess_parent(TEST_WEBSITE)
    soft, hard = resource.getrlimit(rlimit)
    print("Limit after: ", soft, " : ", hard)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("operation", choices=['base', 'sub', 'slim', 'slila', 'multi'])

    args = parser.parse_args()
    if args.operation == "base":
        print("##### Base Test")
        run_tests()
    elif args.operation == "sub":
        print("##### Subprocess Test")
        run_tests_subprocess()
    elif args.operation == "slim":
        limit = 2684354560
        print("##### Test with limit")
        run_tests_subprocess_with_limit(limit)
    elif args.operation == "slila":
        # limit = 8589934592 #64
        limit = 137438953472 #128
        print("##### Test with limit")
        run_tests_subprocess_with_limit(limit)
    elif args.operation == "multi":
        limit = 2684354560
        print("##### Test with unlimited limit")
        run_tests_with_unlimited_limit(limit)

if __name__ == "__main__":
    main()
