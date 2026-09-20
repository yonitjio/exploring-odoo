{
    "name": "Cheat Module",
    "version": "20.0.1.0.0",
    "depends": ["base", "base_setup"],
    "author": "My Name",
    "category": "Customizations",
    "description": """
    Module description
    """,
    "data": [
        "security/ir.access.csv",
        "views/cheat_views.xml",
        "views/cheat_dialog_template_views.xml",
        "views/res_config_settings_views.xml",
        "wizard/cheat_wizard_views.xml",
        "views/cheat_relation_views.xml",
        "views/cheat_qweb_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "cheat_module/static/src/**/*",
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other OSI approved licence",
}
