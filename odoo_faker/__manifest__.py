# For more details see https://www.odoo.com/documentation/17.0/developer/reference/backend/module.html
{
    "name": "Odoo Faker",
    "version": "18.0.1.0.0",
    "author": "Yoni Tjio",
    "category": "Demo",
    "description": """
    Create demo data with Faker.js
    """,
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "odoo_faker/static/src/views/**/*",
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}
