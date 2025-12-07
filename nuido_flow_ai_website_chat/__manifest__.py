# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

{
    "name": "Nuido Flow AI Website Chat",
    "version": "19.0.1.0.0",
    "depends": ["website", "nuido_flow_ai_chat"],
    "author": "Yoni Tjio",
    "category": "Customizations",
    "description": """
    Nuido Flow AI Website Chatbot
    """,
    "data": [
        "views/res_config_settings_views.xml"
    ],
    "assets": {
        'nuido_flow_ai_website_chat.base':[
            'web/static/lib/dompurify/DOMpurify.js',
            'web/static/src/views/fields/file_handler.*',
            'web/static/src/views/fields/formatters.js',
            "ai_chat_base/static/lib/marked.umd.min.js",
            "ai_chat_base/static/lib/highlight/highlight.js",
            "ai_chat_base/static/lib/highlight/styles/base16/solarized-dark.css",
            "ai_chat_base/static/lib/marked-highlight.umd.js",
            "ai_chat_base/static/src/**/*",
        ],
        'nuido_flow_ai_website_chat.assets': [
            ('include', 'web._assets_helpers'),
            ('include', 'web._assets_backend_helpers'),
            'web/static/src/scss/pre_variables.scss',
            'web/static/lib/bootstrap/scss/_variables.scss',
            'web/static/lib/bootstrap/scss/_variables-dark.scss',
            'web/static/lib/bootstrap/scss/_maps.scss',
            ('include', 'web._assets_bootstrap_backend'),
            'web/static/src/scss/bootstrap_overridden.scss',
            'web/static/src/scss/ui.scss',
            'web/static/src/libs/fontawesome/css/font-awesome.css',
            'web/static/lib/odoo_ui_icons/style.css',
            'web/static/src/webclient/webclient.scss',
            ('include', 'web._assets_core'),
            'web/static/src/scss/mimetypes.scss',

            "ai_chat_base/static/lib/highlight/styles/base16/solarized-dark.css",
            "ai_chat_base/static/src/**/*.scss",
            "nuido_flow_ai_website_chat/static/scss/*",
            "nuido_flow_ai_website_chat/static/src/**/*.scss",
        ],
        'web.assets_frontend': [
            ('include', 'nuido_flow_ai_website_chat.base'),
            "nuido_flow_ai_website_chat/static/scss/*",
            "nuido_flow_ai_website_chat/static/src/**/*",
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}
