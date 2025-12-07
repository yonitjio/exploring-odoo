# -*- coding: utf-8 -*-
{
    'name': "AI Advance Bot",
    'summary': """Add AI bot to chat""",
    'description': """
        Add AI bot to chat
    """,
    'author': "Yoni Tjio",
    'category': 'Productivity',
    'version': '17.0.1.0.0',
    'license': 'OPL-1',
    'depends': ['mail', 'bus'],
    'data': [
        'security/ir.model.access.csv',
        'data/res_partner_data.xml',
        'data/res_user_data.xml',
        'data/mail_bot_advai_knowledge_base.xml',
        'views/adv_ai_bot_knowledge_base.xml',
        'wizard/knowledge_base_search.xml'
    ],
    'assets': {
        'web.assets_backend': [
            'adv_ai_bot/static/src/**/*',
        ],
    },
    "license":"Other proprietary",
    "application": True,
    "installable": True,
    "auto_install": False,
    "post_init_hook": "process_initial_knowledge_base"
}
