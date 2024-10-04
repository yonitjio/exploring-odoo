# For more details see https://www.odoo.com/documentation/17.0/developer/reference/backend/module.html
{
    'name': "Cheat Module",
    # The first 2 numbers are Odoo major version, the last 3 are x.y.z version of the module.
    'version': '17.0.1.0.0',
    'depends': ['base', 'base_setup'],
    'author': "My Name",
    # Categories are freeform, for existing categories visit https://github.com/odoo/odoo/blob/17.0/odoo/addons/base/data/ir_module_category_data.xml
    'category': 'Customizations',
    'description': """
    Module description
    """,
    # data files always loaded at installation
    'data': [
        'security/ir.model.access.csv',
        'views/cheat_view.xml',
        'views/cheat_dialog_template_view.xml',
        'views/res_config_settings_view.xml',
        'wizard/cheat_wizard_view.xml'
    ],
    "application": False,
    "installable": True,
    "auto_install": False,
    "license":"Other proprietary",
}