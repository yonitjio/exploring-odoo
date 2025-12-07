{
    "name": "AI Chatbot",
    "version": "18.0.1.0.0",
    "depends": ["web", "bus"],
    "author": "Yoni Tjio",
    "category": "Customizations",
    "description": """
    AI Chatbot
    """,
    "assets": {
    "web.assets_backend": [
            "ai_chat/static/lib/nlux/theme/nova.css",
            "ai_chat/static/lib/nlux/umd/nlux-core.js",
            "ai_chat/static/src/**/*",
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}
