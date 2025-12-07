import logging
_logger = logging.getLogger(__name__)

import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig

from playwright.async_api import async_playwright
from selenium import webdriver

from . import async_utils

async def test_crawl4ai_async(ref_url):
    browser_config = BrowserConfig(verbose=True)
    run_config = CrawlerRunConfig()

    crawler = AsyncWebCrawler(config=browser_config)
    await crawler.start()
    await crawler.arun(
        url=ref_url,
        config=run_config
    )
    await crawler.close()

    
def test_crawl4ai(ref_url):
    async_utils.run_async_function(test_crawl4ai_async, ref_url)
        
async def test_playwright_async(url):
    async with async_playwright() as playwright:
        await asyncio.sleep(0)
        chromium = playwright.chromium
        browser = await chromium.launch(
            timeout=0,
            headless=True,
            traces_dir="traces"
        )
        page = await browser.new_page()
        await page.goto(url)
        await page.title()
        await browser.close()
                
def test_playwright(ref_url):
    async_utils.run_async_function(test_playwright_async, ref_url)
    
async def test_selenium_async(url):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options)
    driver.get(url)
    driver.quit()
                
def test_selenium(ref_url):
    async_utils.run_async_function(test_selenium_async, ref_url)