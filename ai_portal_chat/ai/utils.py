import logging
_logger = logging.getLogger(__name__)

from io import StringIO
from lxml import etree
from markdownify import MarkdownConverter

class AIBotBlockConverter(MarkdownConverter):
    def convert_img(self, el, text, parent_tags):
        alt = el.attrs.get('alt', None) or ''
        src = el.attrs.get('src', None) or ''
        if src.startswith("data:"):
            return alt
        else:
            return super().convert_img(el, text, parent_tags) + '\n\n'

    def convert_a(self, el, text, parent_tags):
        href = el.attrs.get('href', None) or ''
        if self.options["base_url"] and href.startswith("/"):
            base_url = self.options["base_url"] or ''
            el.attrs["href"] = base_url + href
        return super().convert_a(el, text, parent_tags) + '\n\n'

def md(html, **options):
    return AIBotBlockConverter(**options).convert(html)

def html_to_md(base_url, html):
    parser = etree.HTMLParser()
    tree = etree.parse(StringIO(html), parser)
    body = tree.xpath("//body")[0]

    contentMarkdown = md(etree.tostring(body), base_url=base_url)

    return contentMarkdown
