# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
{
    "name": "Nuido Flow AI Addon",
    "summary": """Nuido Flow AI Addon""",
    "description": """
        Nuido Flow AI Addon
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "18.0.1.0.0",
    "depends": ["nuido_flow", "nuido_flow_trigger", "nuido_flow_data"],
    "data": [
            "security/ir.model.access.csv",
            "data/nuido_flow_registry.xml",
            "views/nuido_flow_ai_views.xml"
        ],
    "assets": {
        "web.assets_backend": [
            "nuido_flow_ai/static/src/components/**/*",
            "nuido_flow_ai/static/src/models/**/*",
            "nuido_flow_ai/static/src/app/**/*",
            ('remove', 'nuido_flow_ai/static/src/**/*.dark.scss')
        ],
    },
    "license": "Other proprietary",
    "application": False,
    "installable": True,
    "auto_install": False,
}
