# For more details see https://www.odoo.com/documentation/17.0/developer/reference/backend/module.html
{
    "name": "Cheat Module for Odoo Web Framework",
    # The first 2 numbers are Odoo major version, the last 3 are x.y.z version of the module.
    "version": "18.0.1.0.0",
    "depends": ["web", "cheat_module"],
    "author": "Yoni Tjio",
    # Categories are freeform, for existing categories visit https://github.com/odoo/odoo/blob/17.0/odoo/addons/base/data/ir_module_category_data.xml
    "category": "Customizations",
    "description": """
    Cheat Module for Odoo Web Framework
    """,
    # data files always loaded at installation
    "data": [
        'security/ir.model.access.csv',
        'views/cheat_web_views.xml'
    ],
    "assets": {
        "web.assets_backend": [
            "cheat_web/static/src/**/*",
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}
