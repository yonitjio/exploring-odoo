# © 2025 Yoni
# This software is experimental and provided "as-is".
# No guarantees, warranties, or liability are assumed.
# See the LICENSE file included with this software for full details.

{
    "name": "N2 Elk Layout Addon",
    "version": "19.0.1.0.202511281256",
    "summary": """N2 Elk Layout Addon""",
    "description": """
        N2 Elk Layout Addon
    """,
    "depends": ["n2", "n2_ui"],
    "assets": {
        "web.assets_backend": [
            "n2_elk/static/lib/*",
            "n2_elk/static/src/app/**/*",
            "n2_elk/static/src/utils/**/*",
            "n2_elk/static/src/components/**/*",
        ],
    },
    "category": "Productivity",
    "license": "Other OSI approved licence",
    "author": "Yoni Tjio",
    "website": "https://github.com/yonitjio/exploring-odoo",
    "application": False,
    "installable": True,
    "auto_install": False,
}
