# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.

import logging

from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

from .tools import get_header_nodes, get_graphql_variable_nodes

from odoo.addons.nuido_flow.flows.tools.log_const import LOGGER_NAME
from gql.transport.requests import log as requests_logger
from gql.transport.websockets import log as websockets_logger

_logger = logging.getLogger(LOGGER_NAME)
requests_logger.setLevel(logging.WARNING)
websockets_logger.setLevel((logging.WARNING))

class GraphQlClientNode(BaseNode):
    def _process(self, params) -> any:
        super()._process(params)

        header_nodes = get_header_nodes(self)
        variable_nodes = get_graphql_variable_nodes(self)

        all_headers = {}
        for hn in header_nodes:
            headers = hn.process(params)
            all_headers.update(headers)

        all_variables = {}
        for vn in variable_nodes:
            variables = vn.process(params)
            all_variables.update(variables)

        url = self.definition["url"]
        query = self.definition["query"]

        result = {
            "response": None,
            "exception": None
            }
        try:
            transport = RequestsHTTPTransport(url=url, headers=all_headers)
            client = Client(transport=transport, fetch_schema_from_transport=True)
            gql_query = gql(query)
            result = client.execute(gql_query, all_variables)
        except Exception as e:
            result.update({ "exception": e })
            _logger.warning("Exception when sending request.", exc_info=True)

        return result
