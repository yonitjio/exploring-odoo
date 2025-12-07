// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Default } from "@nuido/utils/registry";
import { SpecAwareNodeModel } from "@nuido/models/spec_aware_node";
import { HttpHeaderPort } from "@nuido_flow_network/components/ports/http_header_port";
export class HttpRequestNodeModel extends SpecAwareNodeModel {
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        const auxInId = "aux-in-" + this.id + "-1";
        this.addAuxInPort(auxInId, HttpHeaderPort.name, 1, {
            role: "http-header"
        });
        this.method = "POST";
        this.url = "";
    }
}
