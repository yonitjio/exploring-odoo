{
    "name": "Quickboard",
    "summary": """Quickboard is a simple and easy to use dashboard.""",
    "description": """
        Quickboard is a simple and easy to use dashboard.
    """,
    "author": "Yoni Tjio",
    "category": "Productivity",
    "version": "19.0.1.0.0",
    "depends": ["web"],
    "data": [
        "security/quickboard_security.xml",
        "security/ir.model.access.csv",
        "views/quickboard_views.xml",
        "views/quickboard_item_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "quickboard/static/src/**/*",
            ("remove", "quickboard/static/src/quickboard/**/*"),
        ],
        "quickboard.assets": [
            ("include", "web.chartjs_lib"),
            "quickboard/static/lib/gridstack/*",
            "quickboard/static/lib/spinjs/*",
            "quickboard/static/src/quickboard/**/*",
            "quickboard/static/src/css/**/*",
        ],
    },
    "license": "Other OSI approved licence",
    "application": True,
    "installable": True,
    "auto_install": False,
}
