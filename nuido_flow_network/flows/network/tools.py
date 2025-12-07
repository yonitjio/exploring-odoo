# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

from odoo.addons.nuido_base.tools.tools import get_aux_nodes_by_role

def get_header_nodes(node):
    return get_aux_nodes_by_role(node, "http-header")

def get_graphql_variable_nodes(node):
    return get_aux_nodes_by_role(node, "graphql-variable")
