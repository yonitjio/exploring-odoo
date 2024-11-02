# -*- coding: utf-8 -*-
from ast import literal_eval

from odoo import http, fields, models
from odoo.http import request
from odoo.osv import expression

class QuickboardController(http.Controller):
    def get_quickboard_item_values(self, quickboard_item, start_date=None, end_date=None, with_data=False):
        vals = {
                'id': quickboard_item.id,
                'name': quickboard_item.name,
                'model_name': quickboard_item.model_name,
                'icon': quickboard_item.icon,
                'type': quickboard_item.type,
                'chart_type': quickboard_item.chart_type,
                'height': quickboard_item.height,
                'width': quickboard_item.width,
                'x_pos': quickboard_item.x_pos,
                'y_pos': quickboard_item.y_pos,
                'value_field_name': quickboard_item.value_field_id.display_name,
                'value_field_type': quickboard_item.value_field_id.ttype,
                'dimension_field_name': quickboard_item.dimension_field_id.display_name,
                'dimension_field_type': quickboard_item.dimension_field_id.ttype,
                'datetime_granularity': quickboard_item.datetime_granularity,
                'list_row_limit': quickboard_item.list_row_limit,
                'aggregate_function': quickboard_item.aggregate_function,
                'text_color': quickboard_item.text_color,
                'background_color': quickboard_item.background_color
            }

        if with_data:
            domain = []
            if start_date:
                sd = fields.Datetime.from_string(start_date)
                domain.append(("create_date", ">", sd))

            if end_date:
                ed = fields.Datetime.from_string(end_date)
                domain.append(("create_date", "<", ed))

            if quickboard_item.domain_filter and quickboard_item.domain_filter != "":
                filter = expression.AND([literal_eval(quickboard_item.domain_filter)])
                domain = expression.AND([domain, filter])

            if quickboard_item.type == "basic":
                aggregate_value = 0
                aggr_func = f"{quickboard_item.value_field_id.name}:{quickboard_item.aggregate_function}"

                agg = request.env[quickboard_item.model_name].sudo()._read_group(
                    domain=domain,
                    groupby=[],
                    aggregates=[aggr_func]
                )
                aggregate_value = agg[0][0] if agg[0][0] else 0
                vals.update({ 'aggregate_value': aggregate_value })
            else:
                data = []

                aggr_func = f"{quickboard_item.value_field_id.name}:{quickboard_item.aggregate_function}"
                group_by = quickboard_item.dimension_field_id.name
                if quickboard_item.dimension_field_id.ttype in ["date", "datetime"]:
                    group_by = f"{group_by}:{quickboard_item.datetime_granularity}"

                limit = quickboard_item.list_row_limit if quickboard_item.type == "list" else None
                order = f"{aggr_func} desc" if quickboard_item.type == "list" else None
                aggs = request.env[quickboard_item.model_name].sudo()._read_group(
                    domain=domain,
                    groupby=[group_by],
                    aggregates=[aggr_func],
                    limit=limit,
                    order=order
                )

                # seq is to ease t-foreach on the javascript part because it needs t-key
                for seq, agg in enumerate(aggs, start=1):
                    if isinstance(agg[0], models.Model):
                        if agg[0]:
                            x_data = agg[0].name
                        else:
                            x_data = "N/A"
                    else:
                        x_data = agg[0]

                    data.append({
                            "seq": seq,
                            "x":  x_data,
                            "y": agg[1]
                        })

                vals.update({'data': data})

        return vals

    @http.route('/quickboard/item', type='json', auth='user', website=True)
    def get_quickboard_item(self, item_id, start_date=None, end_date=None):
        quickboard_item = request.env['quickboard.item'].with_context({"hide_model": True}).search([("id", "=", item_id)])
        vals = self.get_quickboard_item_values(quickboard_item, start_date, end_date, True)
        return vals

    @http.route('/quickboard/item_defs', type='json', auth='user', website=True)
    def get_quickboard_items(self):
        items = []
        for quickboard_item in request.env['quickboard.item'].with_context({"hide_model": True}).search([], order="id"):
            vals = self.get_quickboard_item_values(quickboard_item, None, None, False)
            items.append(vals)
        return items

    @http.route('/quickboard/save_layout', type='json', auth='user', website=True)
    def save_layout(self, layout):
        for item in layout:
            quickboard_item = request.env["quickboard.item"].with_context({"hide_model": True}).search([("id", "=", item["id"])], limit=1)
            quickboard_item.update({
                    "x_pos": item["x"],
                    "y_pos": item["y"],
                    "height": item["h"] if "h" in item else 0,
                    "width": item["w"] if "w" in item else 0
                })
        return True
