{
    'name': "Cheat Inheritance",
    'version': '20.0.1.0.0',
    'depends': ['cheat_module'],
    'author': "My Name",
    'category': 'Customizations',
    'description': """
    Module description
    """,
    'data': [
        'security/ir.access.csv',
        'views/cheat_basic_inherit_extension_views.xml',
        'views/cheat_basic_inherit_primary_views.xml',
        'views/cheat_child_proto_views.xml',
        'views/cheat_child_delegation_views.xml',
    ],
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other OSI approved licence",
}