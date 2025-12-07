# For more details see https://www.odoo.com/documentation/17.0/developer/reference/backend/module.html
{
    'name': "Cheat Inheritance",
    # The first 2 numbers are Odoo major version, the last 3 are x.y.z version of the module.
    'version': '18.0.1.0.0',
    'depends': ['cheat_module'],
    'author': "My Name",
    # Categories are freeform, for existing categories visit https://github.com/odoo/odoo/blob/17.0/odoo/addons/base/data/ir_module_category_data.xml
    'category': 'Customizations',
    'description': """
    Module description
    """,
    # data files always loaded at installation
    'data': [
        'security/ir.model.access.csv',
        'views/cheat_basic_inherit_extension_views.xml',
        'views/cheat_basic_inherit_primary_views.xml',
        'views/cheat_child_proto_views.xml',
        'views/cheat_child_delegation_views.xml',
    ],
    "application": False,
    "installable": True,
    "auto_install": False,
    "license":"Other proprietary",
}