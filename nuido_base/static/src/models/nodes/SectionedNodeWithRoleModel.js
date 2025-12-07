// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { SectionedNodeModel } from "@nuido/models/sectioned_node";
export class SectionedNodeWithRoleModel extends SectionedNodeModel {
    canAddInput(portId, edge, sourceNode) {
        let res = false;
        const port = this.inPorts.find(o => o.id == portId);
        if (port.canAddLink() && sourceNode instanceof SectionedNodeModel) {
            // find related section
            const section = this.sections.find(o => o.inPortId === portId);
            const sourceSection = sourceNode.sections.find(o => o.outPortId == edge.outPortId);
            if (section && sourceSection && section.role == sourceSection.role) {
                res = true;
            }
        }
        return res;
    }
}
