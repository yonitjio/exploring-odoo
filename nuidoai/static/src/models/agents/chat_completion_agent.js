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
import { TextDialogInputSection } from "@nuido_base/components/sections/text_dialog_section";
import { TextInputSection } from "@nuido_base/components/sections/text_section";
export class ChatCompletionAgentNodeModel extends SectionedNodeWithRoleModel {
    setup() {
        let sectionId = uuidv4();
        this.addSection(sectionId, TextInputSection.name, {
            label: "Agent Name",
            default: "nuido",
            role: "agent-name" /* NuidoAiSectionRole.AgentName */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, TextDialogInputSection.name, {
            label: "Instruction",
            default: "You are a helpful AI assistant.",
            role: "agent-instruction" /* NuidoAiSectionRole.AgentInstruction */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect Chat Completion Service here.",
            direction: "in" /* SectionDirectionType.In */,
            role: "chat-completion-service" /* NuidoAiSectionRole.ChatCompletionService */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect Plugins here.",
            direction: "in" /* SectionDirectionType.In */,
            maxIn: Number.MAX_SAFE_INTEGER,
            role: "agent-plugin" /* NuidoAiSectionRole.AgentPlugin */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect to prompt termination strategies from here.",
            direction: "out" /* SectionDirectionType.Out */,
            role: "strategy-termination-agent" /* NuidoAiSectionRole.StrategyTerminationAgent */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect to prompt selection strategies from here.",
            direction: "out" /* SectionDirectionType.Out */,
            role: "strategy-initial-agent" /* NuidoAiSectionRole.StrategyInitialAgent */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect to group chat from here.",
            direction: "out" /* SectionDirectionType.Out */,
            role: "chat-group-agent" /* NuidoAiSectionRole.ChatGroupAgent */
        });
    }
}
