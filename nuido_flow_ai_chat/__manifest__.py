# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
{
    "name": "Nuido Flow AI Chat Addon",
    "summary": """Nuido Flow AI Chat Addon""",
    "description": """
        Nuido Flow AI Chat Addon
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "18.0.1.0.0",
    "depends": ["ai_chat_base", "nuido_flow_ai"],
    "data": [
            "security/ir.model.access.csv",
            "data/nuido_flow_registry.xml",
            "views/node_definition_users.xml"
        ],
    "assets": {
        "web.assets_backend": [
            "nuido_flow_ai_chat/static/src/components/**/*",
            "nuido_flow_ai_chat/static/src/models/**/*",
            "nuido_flow_ai_chat/static/src/app/**/*",
            ('remove', 'nuido_flow_ai_chat/static/src/**/*.dark.scss')
        ],
    },
    "license": "Other proprietary",
    "application": False,
    "installable": True,
    "auto_install": False,
}
