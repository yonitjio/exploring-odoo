# -*- coding: utf-8 -*-
import logging
_logger = logging.getLogger(__name__)

import json
from urllib.request import urlopen, Request

from odoo import http
from odoo.http import request

from ..ai.ai_bot import AiBot

class AiPortalChatController(http.Controller):
    @http.route('/ai_portal_chat/chat', type='json', auth='user', website=True)
    def ai_chat(self, channel, message, history, context, streaming):
        env = request.env
        bot = AiBot(env, context)
        res = bot.chat(channel, message, history, streaming)

        return res

    # region alternative methods to get blog information
    def _get_blog_info_from_context_with_urllib(self, context):
        if ("path" in context and "base_url" in context):
            path = context["path"]
            base_url = context["base_url"]
            if path.startswith("/blog"):
                url = base_url + "/ai_portal_chat" + path
                req = Request(url)
                with urlopen(req) as blog_req:
                    data = blog_req.read();
                    return json.loads(data.decode("utf-8"))

            return False

    def _get_blog_info_from_context(self, context):
        if ("path" in context):
            path = context["path"]
            if path.startswith("/blog"):
                path_parts = path.split("/")
                if len(path_parts) == 4:
                    blog_id = path_parts[-2].split("-")[-1]
                    post_id = path_parts[-1].split("-")[-1]
                    blog = request.env["blog.blog"].search(domain=[("id", "=", blog_id)], limit=1)
                    blog_post = request.env["blog.post"].search(domain=[("id", "=", post_id)], limit=1)

                    info = self._get_blog_info(blog, blog_post)
                    return info

            return False


    def _get_blog_info(self, blog, blog_post):
        info = {
            'category': blog.display_name,
            'title': blog_post.display_name,
            'content': blog_post.content,
        }
        return info

    @http.route([
        '''/ai_portal_chat/blog/<model("blog.blog"):blog>/<model("blog.post", "[('blog_id','=',blog.id)]"):blog_post>''',
    ], type='http', auth="public", cors="*")
    def blog_post(self, blog, blog_post, **kw):
        info = self._get_blog_info(blog, blog_post)

        return json.dumps(info, skipkeys=True)

    # endregion

    @http.route('/ai_portal_chat/assets.<any(css,js):ext>', type='http', auth='public')
    def assets_embed(self, ext, **kwargs):
        if ext not in ('css', 'js'):
            raise request.not_found()

        bundle = 'ai_portal_chat.assets'
        asset = request.env["ir.qweb"]._get_asset_bundle(bundle)
        stream = request.env['ir.binary']._get_stream_from(getattr(asset, ext)())
        return stream.get_response()

    @http.route('/ai_portal_chat/font-awesome', type='http', auth='none', cors="*")
    def fontawesome(self, **kwargs):
        return http.Stream.from_path('web/static/src/libs/fontawesome/fonts/fontawesome-webfont.woff2').get_response()

    @http.route('/ai_portal_chat/odoo_ui_icons', type='http', auth='none', cors="*")
    def odoo_ui_icons(self, **kwargs):
        return http.Stream.from_path('web/static/lib/odoo_ui_icons/fonts/odoo_ui_icons.woff2').get_response()
