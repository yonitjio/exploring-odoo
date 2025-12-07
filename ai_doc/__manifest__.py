{
    "name": "AI Doc",
    "version": "18.0.1.0.0",
    "depends": ["web", "bus"],
    "author": "Yoni Tjio",
    "category": "Customizations",
    "description": """
    AI Chatbot for Odoo Documentation
    """,
    "data": [
        "security/ir.model.access.csv",
        "wizard/doc_ref_link_crawl.xml",
        "views/doc_ref_views.xml",
    ],
    "assets": {
    "web.assets_backend": [
            "ai_doc/static/lib/nlux/theme/nova.css",
            "ai_doc/static/lib/nlux/umd/nlux-core-dev.js",
            "ai_doc/static/src/**/*",
        ],
    },
    "application": True,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}
