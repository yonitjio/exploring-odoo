# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

{
    "name": "Nuido AI Sales Plugin",
    "summary": """Sales Plugin For Nuido AI""",
    "description": """
        Sales Plugin For Nuido AI
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "18.0.1.0.0",
    "depends": ["sale", "nuidoai"],
    "data": [
            "data/nuidoai_registry.xml"
        ],
    "assets": {
        "web.assets_backend": [
            "nuidoai_sales/static/src/components/**/*",
            "nuidoai_sales/static/src/models/**/*",
            "nuidoai_sales/static/src/app/**/*",
        ],
    },
    "license": "Other proprietary",
    "application": False,
    "installable": True,
    "auto_install": False,
}
