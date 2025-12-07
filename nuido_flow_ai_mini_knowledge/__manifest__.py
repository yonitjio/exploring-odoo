{
    "name": "Nuido Flow AI Mini Knowledge",
    "version": "19.0.1.0.0",
    "depends": ["website", "nuido_flow_ai"],
    "author": "Yoni Tjio",
    "category": "Customizations",
    "description": """
    Nuido Flow AI Mini Knowledge
    """,
    "data": [
            "security/ir.model.access.csv",
            "data/nuido_flow_registry.xml",
            "views/res_config_settings_views.xml",
            "views/mini_knowledge_views.xml"
        ],
    "assets": {
        "web.assets_backend": [
            "nuido_flow_ai_mini_knowledge/static/src/components/**/*",
            "nuido_flow_ai_mini_knowledge/static/src/models/**/*",
            "nuido_flow_ai_mini_knowledge/static/src/app/**/*",
            ('remove', 'nuido_flow_ai_mini_knowledge/static/src/**/*.dark.scss')
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}
