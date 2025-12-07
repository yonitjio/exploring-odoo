# -*- coding: utf-8 -*-

{
    'name': 'Gemini Editor',
    'version': '17.0.1.0.0',
    'category': 'Other Tools',
    'author': "Yoni Tjio",
    'summary': 'Incorporate Google Gemini to html editors.',
    'description': """
        Incorporate Google Gemini to html editors.
    """,
    'depends': ['base_setup', 'web_editor'],
    'data':  [
        'views/res_config_settings.xml',
        ],
    'assets': {
        'web_editor.backend_assets_wysiwyg': [
            'gemini_editor/static/src/js/wysiwyg/**/*',
        ],
        'web_editor.assets_wysiwyg': [
            'gemini_editor/static/lib/showdown.js',
        ],
    },
    'application': False,
    'installable': True,
    'auto_install': False,
    'license':"Other proprietary",
}
