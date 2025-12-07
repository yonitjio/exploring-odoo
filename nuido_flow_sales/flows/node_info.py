# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_flow.flows.node_info import getDefaultInfo

from ..flows.sales.sales_summary_odoo_node import SalesSummaryOdooNode
from ..flows.sales.fixed_range_sales_summary_odoo_node import FixedRangeSalesSummaryOdooNode

def build_sales_summary_odoo_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["summary_type"] = node["summary_type"]

    return info

def build_fixed_range_sales_summary_odoo_node(node, edges):
    info = getDefaultInfo(node, edges)
    info["start_date"] = node["start_date"]
    info["end_date"] = node["end_date"]

    return info

def create_sales_summary_odoo_node(environment, create_function_registry, definitions, definition):
    return SalesSummaryOdooNode(environment, create_function_registry, definitions, definition)

def create_fixed_range_sales_summary_odoo_node(environment, create_function_registry, definitions, definition):
    return FixedRangeSalesSummaryOdooNode(environment, create_function_registry, definitions, definition)
