# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

{
    "name": "Nuido Flow Messaging Addon",
    "summary": """Nuido Flow Messaging Addon""",
    "description": """
        Nuido Flow Messaging Addon
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "18.0.1.0.0",
    "depends": ["mail", "nuido_flow"],
    "data": [
            "data/nuido_flow_registry.xml",
            "data/nuido_flow_mail_template.xml"
        ],
    "assets": {
        "web.assets_backend": [
            "nuido_flow_messaging/static/src/components/**/*",
            "nuido_flow_messaging/static/src/models/**/*",
            "nuido_flow_messaging/static/src/app/**/*",
        ],
    },
    "license": "Other proprietary",
    "application": False,
    "installable": True,
    "auto_install": False,
}
