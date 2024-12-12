from odoo import _, fields, models, api

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    login_page_design = fields.Selection(
        string="Login Page Design",
        selection=[
            ("fullscreen_right", "Fullscreen Right"),
            ("fullscreen_left", "Fullscreen Left"),
            ("boxed_left", "Boxed Left"),
            ("boxed_right", "Boxed Right"),
            ("boxed_center", "Boxed Center")
        ],
        config_parameter="backend_theme_explorer.login_page_design"
    )

    login_page_custom_background = fields.Boolean(
        string="Login Page Custom Background",
        config_parameter="backend_theme_explorer.login_page_custom_background"
    )

    login_page_background_image = fields.Binary(
        string="Login Page Background Image"
    )

    login_page_logo = fields.Binary(
        string="Login Page Logo"
    )

    login_page_show_motto = fields.Boolean(
        string="Show Motto",
        config_parameter="backend_theme_explorer.login_page_show_motto"
    )

    login_page_motto_text = fields.Char(
        string="Motto Text",
        config_parameter="backend_theme_explorer.login_page_motto_text"
    )

    login_page_motto_author = fields.Char(
        string="Motto Author",
        config_parameter="backend_theme_explorer.login_page_motto_author"
    )

    login_page_motto_text_color = fields.Char(
        string="Motto Text Color",
        config_parameter="backend_theme_explorer.login_page_motto_text_color"
    )

    def get_values(self):
        vals = super(ResConfigSettings, self).get_values()
        params = self.env['ir.config_parameter'].sudo()
        vals.update(login_page_background_image=params.get_param('backend_theme_explorer.login_page_background_image'))
        vals.update(login_page_logo=params.get_param('backend_theme_explorer.login_page_logo'))
        return vals

    def set_values(self):
        super(ResConfigSettings, self).set_values()
        params = self.env['ir.config_parameter'].sudo()
        params.set_param('backend_theme_explorer.login_page_background_image', self.login_page_background_image)
        params.set_param('backend_theme_explorer.login_page_logo', self.login_page_logo)