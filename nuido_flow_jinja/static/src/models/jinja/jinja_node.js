// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { Default } from "@nuido/utils/registry";
import { LookupPort } from "@nuido_flow_data/components/ports/lookup_port";
export class JinjaNodeModel extends NodeModel {
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        const auxInId = "aux-in-" + this.id + "-1";
        this.addAuxInPort(auxInId, LookupPort.name, Number.MAX_SAFE_INTEGER, {
            role: "lookup"
        });
        this.template = "";
        this.as_dictionary = false;
    }
}
