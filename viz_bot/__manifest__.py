# -*- coding: utf-8 -*-
{
    'name': "Viz Bot",
    'summary': """Import purchase order from image.""",
    'description': """
        Import purchase order from image.
    """,
    'author': "Yoni Tjio",
    'category': 'Productivity',
    'version': '17.0.1.0.0',
    'license': 'OPL-1',
    'depends': ['purchase', 'mail', 'bus'],
    'data': [
        'security/ir.model.access.csv',
        'views/purchase_order_import_image_views.xml',
        'views/purchase_order_views.xml',
        'views/res_config_settings.xml',
        'wizard/ai_assisted_import.xml'
    ],
    'assets': {
        'web.assets_backend': [
            'viz_bot/static/src/**/*',
        ],
    },
    "license":"Other proprietary",
    "application": True,
    "installable": True,
    "auto_install": False
}
