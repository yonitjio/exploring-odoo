# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

# -*- coding: utf-8 -*-
{
    "name": "Nuido Flow Data Addon",
    "summary": """Nuido Flow Data Addon""",
    "description": """
        Nuido Flow Odoo Addon
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "18.0.1.0.0",
    "depends": ["mail", "nuido_flow", "nuido_flow_trigger"],
    "data": [
            "data/nuido_flow_registry.xml",
        ],
    "assets": {
        "web.assets_backend": [
            "nuido_flow_data/static/src/components/**/*",
            "nuido_flow_data/static/src/models/**/*",
            "nuido_flow_data/static/src/app/**/*",
        ],
    },
    "license": "Other proprietary",
    "application": False,
    "installable": True,
    "auto_install": False,
}
