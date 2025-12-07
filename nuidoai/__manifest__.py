# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

# -*- coding: utf-8 -*-
{
    "name": "Nuido AI",
    "summary": """AI chat studio for Odoo""",
    "description": """
        AI chat studio for Odoo
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "18.0.1.0.0",
    "depends": ["base", "web", "nuido", "nuido_base", "ai_chat_base"],
    "data": [
            "security/ir.model.access.csv",
            "views/nuidoai_views.xml",
            "views/res_config_settings_views.xml",
            "data/nuidoai_registry.xml"
        ],
    "assets": {
        "web.assets_backend": [
            "nuidoai/static/src/views/**/*",
            "nuidoai/static/src/chat/**/*",
            "nuidoai/static/src/components/**/*",
            "nuidoai/static/src/models/**/*",
            "nuidoai/static/src/app/**/*",
        ],
    },
    "license": "Other proprietary",
    "application": True,
    "installable": True,
    "auto_install": False,
}
