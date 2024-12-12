# For more details see https://www.odoo.com/documentation/17.0/developer/reference/backend/module.html
{
    "name": "Explorer Backend Theme",
    # The first 2 numbers are Odoo major version, the last 3 are x.y.z version of the module.
    "version": "18.0.1.0.0",
    "depends": ["web", "auth_signup"],
    "author": "Yoni Tjio",
    # Categories are freeform, for existing categories visit https://github.com/odoo/odoo/blob/17.0/odoo/addons/base/data/ir_module_category_data.xml
    "category": "Customizations",
    "description": """
    Explorer backend theme.
    """,
    # data files always loaded at installation
    "data": [
        "views/res_config_settings_views.xml",
        "views/login_templates.xml"
    ],
    "assets": {
        "web.assets_frontend": [
            ('include', 'web._assets_bootstrap_frontend'),
            "backend_theme_explorer/static/fonts/poppins.css",
            "backend_theme_explorer/static/src/scss/login.scss",
        ],
    },
    "application": False,
    "installable": True,
    "auto_install": False,
    "license": "Other proprietary",
}