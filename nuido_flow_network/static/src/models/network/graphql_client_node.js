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
import { GraphQlVariablePort } from "@nuido_flow_network/components/ports/graphql_variable_port";
export class GraphQlClientNodeModel extends SpecAwareNodeModel {
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        const httpHeaderAuxInId = "aux-in-" + this.id + "-http-header";
        this.addAuxInPort(httpHeaderAuxInId, HttpHeaderPort.name, 1, {
            role: "http-header"
        });
        const variableAuxInId = "aux-in-" + this.id + "-variable";
        this.addAuxInPort(variableAuxInId, GraphQlVariablePort.name, 1, {
            role: "graphql-variable"
        });
        this.url = "";
        this.query = "";
    }
}
