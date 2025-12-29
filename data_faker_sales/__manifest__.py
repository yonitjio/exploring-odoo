# © 2025 Yoni
# This software is experimental and provided "as-is".
# No guarantees, warranties, or liability are assumed.
# See the LICENSE file included with this software for full details.

{
    "name": "Demo Sales Data Generator",
    "version": "19.0.1.0.202511281256",
    "description": """
        Demo Sales Data Generator
    """,
    "depends": ["web", "data_faker", "contacts", "sale"],
    "data": [
        'views/contacts_faker_views.xml',
        'views/sale_order_faker_views.xml',
    ],
    "license": "Other proprietary",
    "category": "Web",
    "author": "Yoni Tjio",
    "website": "https://github.com/yonitjio/exploring-odoo",
    "installable": True,
    "application": False,
    "auto_install": False,
}
