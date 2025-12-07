# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

# -*- coding: utf-8 -*-
{
    "name": "Nuido Flow",
    "summary": """Automation for Odoo""",
    "description": """
        Automation for Odoo
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "18.0.1.0.0",
    "depends": ["base", "web", "nuido", "nuido_base"],
    "data": [
            "data/nuido_flow_data.xml",
            "security/ir.model.access.csv",
            "views/nuido_flow_views.xml",
            "data/nuido_flow_registry.xml",
        ],
    "assets": {
        "web.assets_backend": [
            "nuido_flow/static/src/services/**/*",
            "nuido_flow/static/src/views/**/*",
            "nuido_flow/static/src/components/**/*",
            "nuido_flow/static/src/models/**/*",
            "nuido_flow/static/src/app/**/*",
        ],
    },
    "license": "Other proprietary",
    "application": True,
    "installable": True,
    "auto_install": False,
}
