{
    "name": "Cheat Module for Owl",
    "version": "20.0.1.0.0",
    "author": "Yoni Tjio",
    "category": "Customizations",
    "description": """
    Cheat Module for Owl
    """,
    "depends": ["web", "cheat_module"],
    "data": [
        'views/cheat_owl_views.xml',
    ],
    "assets": {
        "web.assets_backend": [
            "cheat_owl/static/src/**/*",
            ("remove", "cheat_owl/static/src/**/*.dark.scss")
        ],
        "web.assets_web_dark": [
            "cheat_owl/static/src/**/*.dark.scss",
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other OSI approved licence",
}
