// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
export class SpecAwareNodeModel extends NodeModel {
    canAddAuxIn(portId, edge, sourceNode) {
        const sourcePort = sourceNode.auxOutPorts.find(o => o.id === edge.outPortId);
        const port = this.auxInPorts.find(o => o.id == portId);
        let res = false;
        if (port && sourcePort) {
            if (sourcePort.direction === "aux-out" /* PortDirection.auxOut */) {
                res = port.canAddLink();
            }
            if (res && ("spec" in port || "spec" in sourcePort)) {
                const spec = "spec" in port ? port["spec"] : null;
                const sourceSpec = "spec" in sourcePort ? sourcePort["spec"] : null;
                let role = spec ? spec["role"] : null;
                let sourceRole = sourceSpec ? sourceSpec["role"] : null;
                res = res && (role === sourceRole);
            }
        }
        return res;
    }
}
