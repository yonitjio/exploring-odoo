// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { TriggerPort } from "@nuido_flow/components/ports/trigger_port";
export class OnCreateTriggerNodeModel extends NodeModel {
    setup() {
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, TriggerPort.name, 1, {
            role: "trigger"
        });
        this.model = "";
        this.model_description = "";
    }
}
