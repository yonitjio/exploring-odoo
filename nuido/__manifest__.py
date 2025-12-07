# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

{
    'name': "Node UI for Odoo",
    'summary': """Node UI for Odoo""",
    'description': """
        Node UI for Odoo
    """,
    'author': "Yoni Tjio",
    'category': 'Productivity',
    'version': '18.0.1.0.0',
    'depends': ['web', 'bus'],
    'assets': {
        "web.assets_backend":[
            "nuido/static/src/utils/**/*",
            "nuido/static/src/models/**/*",
            "nuido/static/src/components/**/*",
            "nuido/static/src/app/**/*",
            ('remove', 'nuido/static/src/**/*.dark.scss')
        ],
        "web.assets_web_dark": [
            ('remove', 'nuido/static/src/components/nuido-theme.scss'),
            ('before', 'nuido/static/src/components/nuido.scss', 'nuido/static/src/components/nuido-theme.dark.scss')
        ],
    },
    "license":"Other proprietary",
    "application": False,
    "installable": True,
    "auto_install": False
}
