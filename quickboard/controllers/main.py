# -*- coding: utf-8 -*-
from ast import literal_eval
import pandas as pd

from odoo import http, fields, models
from odoo.http import request
from odoo.osv import expression
from odoo.tools import DEFAULT_SERVER_DATE_FORMAT

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
                'value_field_name': ",".join([f"{o.display_name}" for o in quickboard_item.value_field_id]),
                'value_field_type': ",".join([f"{o.ttype}" for o in quickboard_item.value_field_id]),
                'dimension_field_name': quickboard_item.dimension_field_id.display_name,
                'dimension_field_type': quickboard_item.dimension_field_id.ttype,
                'datetime_granularity': quickboard_item.datetime_granularity,
                'group_field_name': quickboard_item.group_field_id.display_name,
                'group_field_type': quickboard_item.group_field_id.ttype,
                'list_row_limit': quickboard_item.list_row_limit,
                'aggregate_function': quickboard_item.aggregate_function,
                'text_color': quickboard_item.text_color,
                'background_color': quickboard_item.background_color
            }

        if with_data:
            domain = []

            date_filter_field = "create_date"
            if date_filter_field not in request.env[quickboard_item.model_name]:
                field_iterable = request.env[quickboard_item.model_name]._fields.items()
                new_date_filter_field = next((v for k, v in field_iterable if v.type in ["date", "datetime"]), None)
                date_filter_field = new_date_filter_field.name

            if start_date and date_filter_field is not None:
                sd = fields.Datetime.from_string(start_date)
                domain.append((date_filter_field, ">", sd))

            if end_date and date_filter_field is not None:
                ed = fields.Datetime.from_string(end_date)
                domain.append((date_filter_field, "<", ed))

            if quickboard_item.domain_filter and quickboard_item.domain_filter != "":
                the_filter = expression.AND([literal_eval(quickboard_item.domain_filter)])
                domain = expression.AND([domain, the_filter])

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
            elif quickboard_item.type == 'list':
                data = []
                grouping = []

                aggr_func = f"{quickboard_item.value_field_id.name}:{quickboard_item.aggregate_function}"
                group_by = quickboard_item.dimension_field_id.name
                if quickboard_item.dimension_field_id.ttype in ["date", "datetime"]:
                    group_by = f"{group_by}:{quickboard_item.datetime_granularity}"

                grouping.append(group_by)

                limit = quickboard_item.list_row_limit

                order = f"{aggr_func} desc"

                aggs = request.env[quickboard_item.model_name].sudo()._read_group(
                    domain=domain,
                    groupby=grouping,
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
            else:
                if quickboard_item.group_field_id:
                    data = []
                    grouping = []

                    aggr_func = f"{quickboard_item.value_field_id.name}:{quickboard_item.aggregate_function}"
                    group_by = quickboard_item.dimension_field_id.name
                    if quickboard_item.dimension_field_id.ttype in ["date", "datetime"]:
                        group_by = f"{group_by}:{quickboard_item.datetime_granularity}"

                    grouping.append(group_by)
                    order = f"{grouping[0]} desc, {aggr_func} asc"

                    sub_group = quickboard_item.group_field_id.name
                    if quickboard_item.group_field_id.ttype in "many2one":
                        sub_group = quickboard_item.group_field_id.name

                    if quickboard_item.group_field_id.ttype in ["date", "datetime"]:
                        sub_group = f"{sub_group}:{quickboard_item.datetime_granularity}"

                    grouping.append(sub_group)

                    order = f"{grouping[1]} desc, {grouping[0]} desc, {aggr_func} asc"
                    aggs = request.env[quickboard_item.model_name].sudo()._read_group(
                        domain=domain,
                        groupby=grouping,
                        aggregates=[aggr_func],
                        order=order
                    )

                    if len(aggs) > 0:
                        dimension_field_display_name = quickboard_item.dimension_field_id.display_name
                        group_field_display_name = quickboard_item.group_field_id.display_name
                        value_field_display_name = quickboard_item.value_field_id.display_name
                        df = pd.DataFrame(aggs,
                                        columns=[
                                            dimension_field_display_name,
                                            group_field_display_name,
                                            value_field_display_name
                                        ]
                                    )

                        if (quickboard_item.dimension_field_id.ttype == "many2one"):
                            df[dimension_field_display_name] = df[dimension_field_display_name].map(lambda o: o.name)

                        filler = None
                        if quickboard_item.dimension_field_id.ttype in ["date", "datetime"]:
                            if quickboard_item.datetime_granularity == "year":
                                filler = pd.DataFrame(pd.date_range(
                                            df[dimension_field_display_name].min(),
                                            df[dimension_field_display_name].max(),
                                            freq="YS"
                                        ),
                                        columns=[dimension_field_display_name]
                                    )
                            elif quickboard_item.datetime_granularity == "month":
                                filler = pd.DataFrame(pd.date_range(
                                            df[dimension_field_display_name].min(),
                                            df[dimension_field_display_name].max(),
                                            freq="MS"
                                        ),
                                        columns=[dimension_field_display_name]
                                    )
                            else:
                                filler = pd.DataFrame(pd.date_range(
                                            df[dimension_field_display_name].min(),
                                            df[dimension_field_display_name].max(),
                                            freq="D"
                                        ),
                                        columns=[dimension_field_display_name]
                                    )
                        else:
                            filler = pd.DataFrame(
                                    df[dimension_field_display_name].unique(),
                                    columns=[dimension_field_display_name]
                                )

                        keys = df[group_field_display_name].unique().tolist()

                        for key in keys:
                            dfd = df.loc[
                                        df[group_field_display_name] == key
                                    ][
                                        [
                                            dimension_field_display_name,
                                            value_field_display_name
                                        ]
                                    ]

                            dfd = filler.merge(right=dfd, how="left", on=dimension_field_display_name)

                            if (quickboard_item.value_field_id.ttype in ["integer", "float", "monetary"]):
                                dfd = dfd.fillna(0)
                            else:
                                dfd = dfd.fillna("")

                            if quickboard_item.dimension_field_id.ttype in ["date", "datetime"]:
                                dfd[dimension_field_display_name] = dfd[dimension_field_display_name].dt.strftime(DEFAULT_SERVER_DATE_FORMAT)

                            dataset = dfd.values.tolist()

                            label = "N/A"
                            if isinstance(key, models.Model):
                                label = key.name
                            else:
                                label = key

                            data.append({
                                "label": label,
                                "dataset": dataset
                            })

                    vals.update({'data': data})
                else:
                    data = []

                    group_by = quickboard_item.dimension_field_id.name
                    if quickboard_item.dimension_field_id.ttype in ["date", "datetime"]:
                        group_by = f"{group_by}:{quickboard_item.datetime_granularity}"

                    for value_field in quickboard_item.value_field_id:
                        aggr_func = f"{value_field.name}:{quickboard_item.aggregate_function}"

                        order = f"{group_by} desc, {aggr_func} asc"

                        aggs = request.env[quickboard_item.model_name].sudo()._read_group(
                            domain=domain,
                            groupby=[group_by],
                            aggregates=[aggr_func],
                            order=order
                        )

                        dataset = []
                        for agg in aggs:
                            if isinstance(agg[0], models.Model):
                                if agg[0]:
                                    x_data = agg[0].name
                                else:
                                    x_data = "N/A"
                            else:
                                x_data = agg[0]

                            dataset.append([x_data, agg[1]])

                        data.append({
                                "label": value_field.display_name,
                                "dataset": dataset
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

    @http.route('/quickboard/save_theme', type='json', auth='user', website=True)
    def save_theme(self, theme):
        request.env.user.res_users_settings_id.quickboard_theme = theme
        return True

    @http.route('/quickboard/save_filter', type='json', auth='user', website=True)
    def save_filter(self, start_date, end_date):
        request.env.user.res_users_settings_id.update({
            "quickboard_start_date": start_date,
            "quickboard_end_date": end_date
        })
        return True
