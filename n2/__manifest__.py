#  © 2025 Yoni
#  This software is experimental and provided "as-is".
#  No guarantees, warranties, or liability are assumed.
#  See the LICENSE file included with this software for full details.
{
    "name": "Nuido v2",
    "version": "19.0.1.0.202511281256",
    "summary": """Automation App for Odoo""",
    "description": """
        Automation workflow with node based UI for Odoo.
    """,
    "depends": ["web", "bus", "html_editor"],
    "data": [
        "security/ir.model.access.csv",
        "data/n2_registry.xml",
        "data/n2_data.xml",
        "views/n2_views.xml",
        "views/res_config_settings_views.xml",
    ],
    "category": "Productivity",
    "license": "Other OSI approved licence",
    "author": "Yoni Tjio",
    "website": "https://github.com/yonitjio/exploring-odoo",
    "application": False,
    "installable": True,
    "auto_install": False,
}
