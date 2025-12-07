# -*- coding: utf-8 -*-
{
    'name': "Node UI",
    'summary': """Node UI""",
    'description': """
        Node UI
    """,
    'author': "Yoni Tjio",
    'category': 'Productivity',
    'version': '18.0.1.0.0',
    'depends': ['web'],
    'data': [
        'views/node_ui_views.xml',
    ],
    'assets': {
        "web.assets_backend": [
            "node_ui/static/lib/FileSaver.js",
            "node_ui/static/src/**/*",
        ],
    },
    "license":"Other proprietary",
    "application": True,
    "installable": True,
    "auto_install": False
}
