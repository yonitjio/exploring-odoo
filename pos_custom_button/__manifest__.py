# For more details see https://www.odoo.com/documentation/17.0/developer/reference/backend/module.html
{
    "name": "POS Custom Button",
    # The first 2 numbers are Odoo major version, the last 3 are x.y.z version of the module.
    "version": "18.0.1.0.0",
    "depends": ["point_of_sale"],
    "author": "Yoni Tjio",
    # Categories are freeform, for existing categories visit https://github.com/odoo/odoo/blob/17.0/odoo/addons/base/data/ir_module_category_data.xml
    "category": "Customizations",
    "description": """
    POS Custom Button Example
    """,
    # data files always loaded at installation
    "data": [
    ],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_custom_button/static/src/**/*",
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}
