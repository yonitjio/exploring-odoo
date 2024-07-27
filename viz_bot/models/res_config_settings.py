from odoo import models, fields

class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    ai_server_address = fields.Char(
        string="AI server IP address",
        help="Type AI server IP address here",
        config_parameter="viz_bot.ai_server_address",
        default="127.0.0.1"
    )

    ai_assisted_import_purchase_default_supplier_id = fields.Many2one(comodel_name="res.partner",
        string="Default Supplier",
        help="Default supplier used when importing the purchase order",
        config_parameter="viz_bot.default_supplier"
    )