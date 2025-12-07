# -*- coding: utf-8 -*-
import logging

from odoo import _, fields, models, api, Command

class SaleOrderSummaryAltLine(models.TransientModel):
    _name = "sale.order.summary.alt.line"

    summary_id = fields.Many2one(comodel_name="sale.order.summary.alt")
    name = fields.Char("Order")
    partner_id = fields.Many2one(comodel_name="res.partner", string="Customer")
    amount_total = fields.Monetary("Amount", currency_field="currency_id")
    amount_paid = fields.Monetary("Paid", currency_field="currency_id")
    currency_id = fields.Many2one(comodel_name='res.currency')
    number_of_products = fields.Integer("# of Products")
    qty = fields.Float("Qty")

class SaleOrderSummaryAlt(models.TransientModel):
    _name = "sale.order.summary.alt"
    _description = "Alternative Sale Order Summary"

    line_ids = fields.One2many(comodel_name="sale.order.summary.alt.line", inverse_name="summary_id")

    @api.model_create_multi
    def create(self, vals_list):
        wizards = super().create(vals_list)
        active_ids = wizards.env.context["active_ids"]
        sale_orders = wizards.env["sale.order"].browse(active_ids)

        lines = []
        for order in sale_orders:
            number_of_products = len([o.product_id.id for o in order.order_line])
            qty = sum([o.product_uom_qty for o in order.order_line])
            vals = {
                'name': order.name,
                'partner_id': order.partner_id.id,
                'amount_total': order.amount_total,
                'amount_paid': order.amount_paid,
                'currency_id': order.currency_id.id,
                'number_of_products': number_of_products,
                'qty': qty
            }
            cmd = Command.create(vals)
            lines.append(cmd)

        wizards.line_ids = lines

        return wizards
