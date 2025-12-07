# -*- coding: utf-8 -*-
import logging

from odoo import _, fields, models, api
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)

class SaleOrderSummary(models.TransientModel):
    _name = "sale.order.summary"
    _description = "Sale Order Summary"

    order_ids = fields.Many2many('sale.order', compute='_compute_selected_sale_order')

    def _compute_selected_sale_order(self):
        for rec in self:
            rec.order_ids = self.env.context["active_ids"];
