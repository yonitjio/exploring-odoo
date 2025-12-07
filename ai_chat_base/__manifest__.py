# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

{
    "name": "AI Chatbot Base",
    "version": "18.0.1.0.0",
    "depends": ["web", "bus"],
    "author": "Yoni Tjio",
    "category": "Customizations",
    "description": """
    AI Chatbot Base
    """,
    "assets": {
        "web.assets_backend": [
            "ai_chat_base/static/lib/marked.umd.min.js",
            "ai_chat_base/static/lib/highlight/highlight.js",
            "ai_chat_base/static/lib/highlight/styles/base16/solarized-dark.css",
            "ai_chat_base/static/lib/marked-highlight.umd.js",
            "ai_chat_base/static/src/**/*",
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}
