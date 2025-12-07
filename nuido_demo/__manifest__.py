# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

{
    'name': "Node UI for Odoo Demo App",
    'summary': """Node UI for Odoo Demo App""",
    'description': """
        Node UI for Odoo
    """,
    'author': "Yoni Tjio",
    'category': 'Productivity',
    'version': '18.0.1.0.0',
    'depends': ['web', 'nuido'],
    'data': [
        "views/nuido_demo_views.xml"
    ],
    'assets': {
        "web.assets_backend": [
            "nuido_demo/static/lib/FileSaver.js",
            "nuido_demo/static/src/app/**/*",
            ('remove', 'nuido_demo/static/src/**/*.dark.scss')
        ],
        "web.assets_web_dark": [
            'nuido_demo/static/src/**/*.dark.scss',
        ],
    },
    "license":"Other proprietary",
    "application": False,
    "installable": True,
    "auto_install": False
}
