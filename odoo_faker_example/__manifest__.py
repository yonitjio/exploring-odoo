# For more details see https://www.odoo.com/documentation/17.0/developer/reference/backend/module.html
{
    "name": "Odoo Faker Example",
    "version": "18.0.1.0.0",
    "author": "Yoni Tjio",
    "category": "Demo",
    "description": """
    Example of creating demo data with Odoo Faker module
    """,
    "depends": ["web", "cheat_module", "contacts", "sale"],
    "data": [
        'views/cheat_relation_faker_views.xml',
        'views/contacts_faker_views.xml',
        'views/sale_order_faker_views.xml',
        'views/faker_views.xml'
    ],
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}
