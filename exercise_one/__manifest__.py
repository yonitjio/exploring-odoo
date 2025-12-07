# For more details see https://www.odoo.com/documentation/17.0/developer/reference/backend/module.html
{
    'name': "Exercise One",
    # The first 2 numbers are Odoo major version, the last 3 are x.y.z version of the module.
    'version': '18.0.1.0.0',
    'depends': ['sale'],
    'author': "Yoni Tjio",
    # Categories are freeform, for existing categories visit https://github.com/odoo/odoo/blob/17.0/odoo/addons/base/data/ir_module_category_data.xml
    'category': 'Demo',
    'description': """
    Exercise One: three ways to process selected records on list view.
    """,
    # data files always loaded at installation
    'data': [
        'security/ir.model.access.csv',
        'wizard/sale_order_summary.xml',
        'wizard/sale_order_summary_alt.xml',
        'views/sale_order_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'exercise_one/static/src/**/*',
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license":"Other proprietary",
}