# -*- coding: utf-8 -*-

{
    "name": "Gemini Dashboard",
    "version": "17.0.1.0.0",
    "category": "Other Tools",
    "author": "Yoni Tjio",
    "summary": "Explain dashboard with Google Gemini.",
    "description": """
        Explain dashboard with Google Gemini.
    """,
    "depends": ["base", "web", "web_editor", "gemini_editor"],
    "data": [
        "views/gemini_dashboard_views.xml",
        "security/ir.model.access.csv",
    ],
    "assets": {
        "web.assets_backend": [
            "gemini_dashboard/static/src/**/*",
            ("remove", "gemini_dashboard/static/src/dashboard/**/*"),
        ],
        "gemini_dashboard.dashboard": [
            "gemini_dashboard/static/src/dashboard/**/*",
        ],
    },
    "application": True,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}
