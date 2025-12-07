// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { uuidv4 } from "@nuido/utils/utils";
import { SectionedNodeWithRoleModel } from "@nuido_base/models/nodes/SectionedNodeWithRoleModel";
import { LabelSection } from "@nuido_base/components/sections/label_section";
export class SalesPluginNodeModel extends SectionedNodeWithRoleModel {
    setup() {
        let sectionId = uuidv4();
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect to agents from here.",
            direction: "out" /* SectionDirectionType.Out */,
            maxOut: Number.MAX_SAFE_INTEGER,
            role: "agent-plugin" /* NuidoAiSectionRole.AgentPlugin */
        });
    }
}
