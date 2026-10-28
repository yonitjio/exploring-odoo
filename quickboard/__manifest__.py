{
    "name": "Quickboard",
    "summary": """Quickboard is a simple and easy to use dashboard.""",
    "description": """
        Quickboard is a simple and easy to use dashboard.
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "20.0.1.0.0",
    "depends": ["web"],
    "data": [
        "security/quickboard_security.xml",
        "security/ir.access.csv",
        "views/quickboard_views.xml",
        "views/quickboard_board_views.xml",
        "views/quickboard_item_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "quickboard/static/src/**/*",
            ("remove", "quickboard/static/src/quickboard/**/*"),
            ("remove", "quickboard/static/src/styles/**/*"),
        ],
        "quickboard.assets": [
            ("include", "web.chartjs_lib"),
            "quickboard/static/lib/gridstack/*",
            "quickboard/static/lib/spinjs/*",
            "quickboard/static/src/quickboard/**/*",
        ],
        "quickboard.light_assets": [
            ("include", "quickboard.assets"),
            "quickboard/static/src/styles/variables.scss",
            "quickboard/static/src/styles/quickboard.scss",
        ],
        "quickboard.dark_assets": [
            ("include", "quickboard.assets"),
            "quickboard/static/src/styles/variables.dark.scss",
            "quickboard/static/src/styles/quickboard.scss",
        ]
    },
    "license": "Other OSI approved licence",
    "application": True,
    "installable": True,
    "auto_install": False,
}
