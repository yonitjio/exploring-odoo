from odoo import models

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def _prepare_confirmation_values(self):
        res = super()._prepare_confirmation_values()
        res.pop("date_order")

        return res
