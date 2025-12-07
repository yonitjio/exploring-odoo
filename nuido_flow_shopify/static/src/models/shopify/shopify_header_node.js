// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { HttpHeaderPort } from "@nuido_flow_network/components/ports/http_header_port";
export class ShopifyHeaderNodeModel extends NodeModel {
    setup() {
        const auxOutId = "aux-out-" + this.id + "-1";
        this.addAuxOutPort(auxOutId, HttpHeaderPort.name, 1, {
            role: "http-header"
        });
        this.secret = "";
    }
}
