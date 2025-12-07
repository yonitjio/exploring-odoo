# -*- coding: utf-8 -*-
{
    'name': "Node UI Basics",
    'summary': """Node UI Basics""",
    'description': """
        Tech stacks for developing Node UI
    """,
    'author': "Yoni Tjio",
    'category': 'Productivity',
    'version': '18.0.1.0.0',
    'depends': ['web'],
    'data': [
        'views/node_ui_basics_views.xml',
    ],
    'assets': {
        "web.assets_backend": [
            "node_ui_basics/static/src/**/*",
        ],
    },
    "license":"Other proprietary",
    "application": True,
    "installable": True,
    "auto_install": False
}
