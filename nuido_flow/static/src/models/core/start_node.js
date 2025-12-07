// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Default } from "@nuido/utils/registry";
import { StarterPort } from "@nuido_flow/components/ports/starter_port";
import { TriggerPort } from "@nuido_flow/components/ports/trigger_port";
import { SpecAwareNodeModel } from "@nuido/models/spec_aware_node";
export class StartNodeModel extends SpecAwareNodeModel {
    setup() {
        const triggerId = "trigger-" + this.id + "-1";
        this.addInPort(triggerId, TriggerPort.name, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        const auxInId = "aux-in-" + this.id + "-1";
        this.addAuxInPort(auxInId, StarterPort.name, Number.MAX_SAFE_INTEGER, {
            role: "starter"
        });
        this.parameters = "";
    }
    canAddInput(portId, edge, sourceNode) {
        const sourcePort = sourceNode.outPorts.find(o => o.id === edge.outPortId);
        let res = false;
        if ((sourcePort === null || sourcePort === void 0 ? void 0 : sourcePort.direction) === "output" /* PortDirection.out */) {
            const port = this.inPorts.find(o => o.id == portId);
            if (port) {
                res = port.canAddLink();
            }
            else {
                res = false;
            }
        }
        else {
            res = false;
        }
        if (res && "spec" in sourcePort) {
            if ("role" in sourcePort["spec"]) {
                res = res && (sourcePort.spec["role"] === "trigger");
            }
            else {
                res = false;
            }
        }
        return res;
    }
}
