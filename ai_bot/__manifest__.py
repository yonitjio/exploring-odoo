# -*- coding: utf-8 -*-
{
    'name': "AI Bot",
    'summary': """Add AI bot to chat""",
    'description': """
        Add AI bot to chat
    """,
    'author': "Yoni Tjio",
    'category': 'Productivity',
    'version': '17.0.1.0.0',
    'license': 'OPL-1',
    'depends': ['mail'],
    'data': [
        'data/res_partner_data.xml',
        'data/res_user_data.xml',
        'data/discuss_channel_data.xml',
        'views/res_config_settings_views.xml',
        'views/res_company_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'ai_bot/static/src/**/*',
        ],
    },
    "license":"Other proprietary",
    "application": True,
    "installable": True,
    "auto_install": False,
}
