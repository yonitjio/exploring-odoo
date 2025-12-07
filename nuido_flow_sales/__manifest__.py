# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

{
    "name": "Nuido Flow Sales Addon",
    "summary": """Nuido Flow Sales Addon""",
    "description": """
        Nuido Flow Sales Addon
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "18.0.1.0.0",
    "depends": ["sale", "nuido_flow"],
    "data": [
            "data/nuido_flow_registry.xml"
        ],
    "assets": {
        "web.assets_backend": [
            "nuido_flow_sales/static/src/components/**/*",
            "nuido_flow_sales/static/src/models/**/*",
            "nuido_flow_sales/static/src/app/**/*",
        ],
    },
    "license": "Other proprietary",
    "application": False,
    "installable": True,
    "auto_install": False,
}
