# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.
import hmac
import hashlib
import base64

from werkzeug.exceptions import Unauthorized
from odoo.http import request
from odoo.addons.nuido_flow.flows.core.base_node import BaseNode

class ShopifyAuthNode(BaseNode):
    def _calc_shopify_secret(self, secret):
        data = request.httprequest.get_data(cache=False)
        hmac_digest = hmac.new(secret, data, hashlib.sha256).digest()
        shopify_secret = base64.b64encode(hmac_digest).decode()

        return shopify_secret

    def _process(self, params) -> any:
        super()._process(params)

        secret = str(self.definition["secret"]).encode()
        shopify_secret = self._calc_shopify_secret(secret)

        if shopify_secret != request.httprequest.headers.environ["HTTP_X_SHOPIFY_HMAC_SHA256"]:
            self.next_node_info = None
            if self.definition["raise_error"]:
                raise Unauthorized()

        return params
