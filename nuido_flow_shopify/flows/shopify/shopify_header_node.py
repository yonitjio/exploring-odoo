# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import json
import hmac
import hashlib
import base64

from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class ShopifyHeaderNode(BaseNode):
    def _process(self, params) -> any:
        super()._process(params)

        secret = str(self.definition["secret"]).encode()

        return {
            "X-Shopify-Access-Token": secret
        }
