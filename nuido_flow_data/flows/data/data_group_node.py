# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import ast
import pandas as pd

from odoo import models

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

from .tools import get_data_filter_nodes

class DataGroupNode(BaseNode):
    def _process(self, params):
        super()._process(params)

        domain = []
        if ("domain" in params):
            domain = params["domain"]

        data = self._query_data(domain)

        return {
                self.definition["key"]: data
            }


    def _query_data(self, additional_domain):
        model_name = self.definition["model"]
        model = self.env[model_name]

        node_def = self.definition

        field_infos = node_def["fields"]

        domain = ast.literal_eval(self.definition["domain"])
        domain = domain + additional_domain

        filter_nodes = get_data_filter_nodes(self)
        for node in filter_nodes:
            filter_domain = node.process({})
            domain = domain + filter_domain["filter"]

        datetime_granularity = node_def["datetime_granularity"]

        group_field_name = node_def["group_field"]
        group_field_meta = self.env["ir.model.fields"]._get(model_name, group_field_name)

        aggr_funcs = []
        orders = []
        value_field_metas = []

        group_by = group_field_name
        if group_field_meta.ttype in ["date", "datetime"]:
            group_by = f"{group_by}:{datetime_granularity}"

        for field_info in field_infos:
            value_field_name = field_info["value"]
            value_field_meta = self.env["ir.model.fields"]._get(model_name, value_field_name)
            value_field_metas.append(value_field_meta)

            aggr_func = f"{value_field_name}:{node_def["aggregate_function"]}"
            aggr_funcs.append(aggr_func)

            orders.append(f"{aggr_func} asc")

        order = f"{group_by} desc"
        order = order + "," + ",".join(orders)

        aggs = model.sudo()._read_group(
            domain=domain,
            groupby=[group_by],
            aggregates=aggr_funcs,
            order=order
        )

        group_field_display_name = group_field_meta.field_description
        value_field_display_names = [o.field_description for o in value_field_metas]
        df = pd.DataFrame(aggs,
                        columns=[
                            group_field_display_name,
                            *value_field_display_names
                        ]
                    )

        df = df.map(lambda o: o.name if isinstance(o, models.Model) else o)
        res = df

        output_type = self.definition["output_type"]

        if output_type == "array":
            res = df.to_dict("records")
        elif output_type == "html":
            res = res.to_html()

        return res