# -*- coding: utf-8 -*-
from typing import Dict, List

from odoo import api, fields, models
from odoo.exceptions import ValidationError

class QuickboardItem(models.Model):
    _name = "quickboard.item"
    _description = "Quickboard Item"

    name = fields.Char(string="Name")
    model_id = fields.Many2one('ir.model', string='Model')
    model_name = fields.Char(related='model_id.model', string="Model Name")
    icon = fields.Char(string="Icon")
    type = fields.Selection(
        selection=[("basic", "Basic"), ("chart", "Chart"), ("list", "List")],
        string="Item Type",
        default="basic")
    chart_type = fields.Selection(
        selection=[("bar", "Bar"), ('doughnut', "Doughnut"), ("line", "Line"), ("pie", "Pie"), ("polar", "Polar Area")],
        string="Chart Type")

    value_field_id = fields.Many2one("ir.model.fields", string="Value Field")
    aggregate_function = fields.Selection(
        selection=[("avg","Average"), ("count", "Count"), ('max', "Max"), ('min', "Min"), ("sum","Sum")],
        string="Aggregate Function",
        default="count",
        depends=['value_field_id'])

    dimension_field_id = fields.Many2one("ir.model.fields", string="Dimension Field")
    datetime_granularity = fields.Selection(
        selection=[("year", "Year"), ("month", "Month"), ("day", "Day")],
        string="Date/Time Granularity",
        default="day",
        depends=['dimension_field_id'])

    list_row_limit = fields.Integer(string="Row limit", default=10)

    domain_filter = fields.Char(string="Filter")

    # basic item color
    text_color = fields.Char(string="Text Color", default="#000000")
    background_color = fields.Char(string="Background Color", default="#ffffff")

    # layout
    x_pos = fields.Integer(string="X Pos")
    y_pos = fields.Integer(string="Y Pos")
    height = fields.Integer(string="Height")
    width = fields.Integer(string="Width")

    @api.model_create_multi
    def create(self, vals_list):
        for val in vals_list:
            if not self.env.context.get("ai_generation", False):
                if 'type' in val:
                    if val["type"] == "basic":
                        val["width"] = 2
                        val["height"] = 1
                    else:
                        val["width"] = 4
                        val["height"] = 2

                sql = f"""WITH item_dim AS (
                            SELECT y_pos, CASE WHEN height = 0 THEN 1 ELSE height END AS height
                            FROM quickboard_item sdi WHERE create_uid = {self.env.uid}
                        )
                        SELECT max(y_pos + height) as max_y_pos FROM item_dim WHERE y_pos = (SELECT max(y_pos) FROM item_dim);
                    """
                self.env.cr.execute(sql)
                res = self.env.cr.dictfetchall()
                max_y_pos = res[0].get("max_y_pos")
                val["y_pos"] = max_y_pos
                val["x_pos"] = 0

        return super().create(vals_list)

    @api.constrains("aggregate_function", "value_field_id")
    def _validate_aggregate_function(self):
        for rec in self:
            if rec.value_field_id.ttype not in ['float', 'integer', 'monetary'] and rec.aggregate_function != "count":
                raise ValidationError(f"Other fields than float, integer and monetary can only use count as aggregation.")

    @api.constrains("dimension_field_id", "type")
    def _validate_dimension_field(self):
        for rec in self:
            if rec.type in ["chart", "list"] and not rec.dimension_field_id:
                raise ValidationError("Dimension field is required for charts.")

    @api.constrains("list_row_limit", "type")
    def _validate_dimension_field(self):
        for rec in self:
            if rec.type == "list" and not rec.list_row_limit:
                raise ValidationError("Row limit is required for lists.")

    @api.constrains("dimension_field_id", "datetime_granularity")
    def _validate_dimension_field(self):
        for rec in self:
            if rec.dimension_field_id.ttype in ["date", "datetime"] and not rec.datetime_granularity:
                raise ValidationError("Granularity for date or datetime field is required for charts.")

    def web_save(self, vals, specification: Dict[str, Dict], next_id=None) -> List[Dict]:
        res = super(QuickboardItem, self).web_save(vals, specification=specification, next_id=next_id)
        self.env["bus.bus"]._sendone(
                "quickboard",
                "quickboard_item_updated",
                {
                    "id": self.id,
                }
            )
        return res
