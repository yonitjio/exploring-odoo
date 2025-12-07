import logging
_logger = logging.getLogger(__name__)

import json
import re

from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import JsonXPathExtractionStrategy
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator

from . import async_utils

def prep_configs(schema, md_generator):
    extraction_strategy = JsonXPathExtractionStrategy(schema, verbose=True)
    browser_config = BrowserConfig(headless=True, verbose=True)
    run_config = CrawlerRunConfig(
        markdown_generator=md_generator,
        extraction_strategy=extraction_strategy,
        cache_mode=CacheMode.DISABLED
    )

    return browser_config, run_config

async def crawl_doc_ref_async(ref_url):
    schema = {
    "name": "Document",
    "baseSelector": "//main",
    "fields": [
            {
                "name": "title",
                "selector": ".//article[@id='o_content']/div[@role='main']/section[1]/h1",
                "type": "text",
            },
            {
                "name": "content",
                "selector": ".//article",
                "type": "text",
            },
        ],
    }
    md_generator = DefaultMarkdownGenerator(
        options={
            "ignore_links": True,
            "escape_html": True,
            "ignore_images": True,
            "skip_internal_links": False
        }
    )

    browser_config, run_config = prep_configs(schema, md_generator)

    async with AsyncWebCrawler(config=browser_config) as crawler:
        crawl_result = await crawler.arun(url=ref_url, config=run_config)
        results = json.loads(crawl_result.extracted_content)
        if len(results) > 0:
            for res in results:
                title = res['title'].replace('¶', '')
                content = res['content'].replace('¶', '').replace('Edit on GitHub', '')
                content = re.sub(r'\n\s*\n', '\n\n', content)
                return title, content
        else:
            return "", ""

def crawl_doc_ref(ref_url):
    return async_utils.run_async_function(crawl_doc_ref_async, ref_url)

async def crawl_doc_links_async(base_url):
    schema = {
    "name": "Links",
    "baseSelector": "//div[@id='o_main_toctree']/ul//li/a",
    "baseFields": [
            {
                "name": "title",
                "type": "text"
            },
            {
                "name": "link",
                "type": "attribute",
                "attribute": "href"
            },
        ],
    "fields": []
    }
    md_generator = DefaultMarkdownGenerator(
        options={
            "ignore_links": False,
            "escape_html": True,
            "ignore_images": True,
            "skip_internal_links": False
        }
    )

    browser_config, run_config = prep_configs(schema, md_generator)

    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(url=base_url, config=run_config)
        base_link = base_url

        if re.search('(?<=\\.).*$', base_url): base_link = '/'.join(base_url.split('/')[:-1])

        if base_link[:-1] != "/": base_link = base_link + "/"

        links = json.loads(result.extracted_content)
        result = []
        for l in links:
            if l['link'] == "#": continue
            title = l['title']
            link = l['link']
            result.append({ "title": title, "link": base_link + link })

        return result

def crawl_doc_links(ref_url):
    return async_utils.run_async_function(crawl_doc_links_async, ref_url)
