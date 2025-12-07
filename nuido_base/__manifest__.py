# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

# -*- coding: utf-8 -*-
{
    "name": "Nuido Base",
    "summary": """Nuido Base App""",
    "description": """
        Nuido Base App
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "18.0.1.0.0",
    "depends": ["base", "web", "html_editor", "nuido"],
    "data": [
            "security/ir.model.access.csv",
            "views/registry_views.xml",
            "views/node_definition_views.xml",
            "views/nuido_views.xml",
        ],
    "assets": {
        "web.assets_backend": [
            "nuido_base/static/src/utils/**/*",
            "nuido_base/static/src/models/**/*",
            "nuido_base/static/src/components/**/*",
            "nuido_base/static/src/views/**/*",
            "nuido_base/static/src/app/**/*",
            ('remove', 'nuido_base/static/src/**/*.dark.scss')
        ],
        "web.assets_web_dark": [
            'nuido_base/static/src/**/*.dark.scss',
        ],
    },
    "license": "Other proprietary",
    "application": False,
    "installable": True,
    "auto_install": False,
}
