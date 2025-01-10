from odoo import models, api
import logging

logger = logging.getLogger(__name__)

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    @api.model
    def get_summary(self, domain = []):
        recs = self.env["sale.order"].search_fetch(domain, ["name", "partner_id", "amount_total", "amount_paid"])
        res = []
        for rec in recs:
            res.append({
                "name": rec["name"],
                "customer": rec["partner_id"].name,
                "amountTotal": rec["amount_total"],
                "amountPaid": rec["amount_paid"],
                "numOfProduct": len(rec["order_line"]),
                "productQty": sum([o.product_uom_qty for o in rec.order_line])
            })
        return {
            "result": res
        }

    # region actions
    def action_summary(self):
        wizard = self.env['sale.order.summary'].create({})
        return {
            'type': 'ir.actions.act_window',
            'target': 'new',
            'name': 'Sale Order Summary',
            'view_id': self.env.ref('exercise_one.sale_order_summary_view').id,
            'view_mode': 'form',
            'res_model': 'sale.order.summary',
            'res_id': wizard.id
        }

    def action_summary_alt(self):
        wizard = self.env['sale.order.summary.alt'].create({})
        return {
            'type': 'ir.actions.act_window',
            'target': 'new',
            'name': 'Sale Order Summary',
            'view_id': self.env.ref('exercise_one.sale_order_summary_alt_view').id,
            'view_mode': 'form',
            'res_model': 'sale.order.summary.alt',
            'res_id': wizard.id
        }
    # endregion
