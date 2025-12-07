// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { HttpHeaderPort } from "@nuido_flow_network/components/ports/http_header_port";
export class HttpHeaderNodeModel extends NodeModel {
    setup() {
        const auxOutId = "aux-out-" + this.id + "-1";
        this.addAuxOutPort(auxOutId, HttpHeaderPort.name, 1, {
            role: "http-header"
        });
        this.http_headers = [];
    }
    addOrUpdateHeader(name, value, is_mask_value) {
        const field = this.http_headers.find(o => o.name === name);
        if (field) {
            field.value = value;
        }
        else {
            this.http_headers.push({
                name: name,
                value: value,
                is_mask_value: is_mask_value
            });
        }
    }
    removeHeader(name) {
        const field_idx = this.http_headers.findIndex(o => o.name === name);
        if (field_idx > -1) {
            this.http_headers.splice(field_idx, 1);
        }
    }
}
