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
import { TextInputSection } from "@nuido_base/components/sections/text_section";
import { TextDialogInputSection } from "@nuido_base/components/sections/text_dialog_section";
export class PromptSelectionStrategyNodeModel extends SectionedNodeWithRoleModel {
    setup() {
        let sectionId = uuidv4();
        this.addSection(sectionId, TextInputSection.name, {
            label: "Name",
            default: "selection",
            role: "strategy-name" /* NuidoAiSectionRole.StrategyName */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, TextDialogInputSection.name, {
            label: "Prompt",
            default: `
Determine which participant takes the next turn in a conversation based on the the most recent participant.
State only the name of the participant to take the next turn.
No participant should take more than one turn in a row.

Choose only from these participants:
##### REPLACE THIS WITH THE REAL AGENT NAMES  #####
## Example:
## - {AGENT_A}
## - {AGENT_B}
## - {AGENT_C}

Always follow these rules when selecting the next participant:
##### REPLACE THIS WITH THE ACTUAL RULES  #####
## Example:
## - After user input, it is {AGENT_A}'s turn.
## - After {AGENT_A} replies, it is {AGENT_B}'s turn.
## - After {AGENT_B} replies, it is {AGENT_C}'s turn.
## - After {AGENT_C} provides feedback, it is {AGENT_A}'s turn.

History:
{{{{${"$history" /* NuidoAiStrategyVariableName.History */}}}}}
`,
            role: "strategy-prompt" /* NuidoAiSectionRole.StrategyPrompt */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect initial agent here.",
            direction: "in" /* SectionDirectionType.In */,
            role: "strategy-initial-agent" /* NuidoAiSectionRole.StrategyInitialAgent */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect Chat Completion Service here.",
            direction: "in" /* SectionDirectionType.In */,
            role: "chat-completion-service" /* NuidoAiSectionRole.ChatCompletionService */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect to a chat group from here.",
            direction: "out" /* SectionDirectionType.Out */,
            role: "chat-group-selection-strategy" /* NuidoAiSectionRole.ChatGroupSelectionStrategy */
        });
    }
}
