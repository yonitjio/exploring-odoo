# -*- coding: utf-8 -*-
{
    'name': "Calendar Bot",
    'summary': """Smart Calendar Bot""",
    'description': """
        Smart Calendar Bot
    """,
    'author': "Yoni Tjio",
    'category': 'Productivity',
    'version': '17.0.1.0.0',
    'license': 'OPL-1',
    'depends': ['mail', 'bus', 'calendar', ],
    'data': [
        'security/ir.model.access.csv',
        'data/res_partner_data.xml',
        'data/res_user_data.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'calendar_bot/static/src/**/*',
        ],
    },
    "license":"Other proprietary",
    "application": True,
    "installable": True,
    "auto_install": False
}
