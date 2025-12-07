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
export class PromptTerminationStrategyNodeModel extends SectionedNodeWithRoleModel {
    setup() {
        let sectionId = uuidv4();
        this.addSection(sectionId, TextInputSection.name, {
            label: "Name",
            default: "termination",
            role: "strategy-name" /* NuidoAiSectionRole.StrategyName */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, TextInputSection.name, {
            label: "Termination Keyword",
            default: "finished",
            role: "strategy-termination-keyword" /* NuidoAiSectionRole.StrategyTerminationKeyword */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, TextInputSection.name, {
            label: "Maximum Iteration",
            default: "10",
            role: "strategy-max-iteration" /* NuidoAiSectionRole.StrategyMaxIteration */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, TextDialogInputSection.name, {
            label: "Prompt",
            default: `
Determine if the conversation is finished.  If so, respond with a single word: {${"termination_keyword" /* NuidoAiStrategyVariableName.TerminationKeyword */}}

History:
{{${"$history" /* NuidoAiStrategyVariableName.History */}}}
`,
            role: "strategy-prompt" /* NuidoAiSectionRole.StrategyPrompt */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect Chat Completion Service here.",
            direction: "in" /* SectionDirectionType.In */,
            role: "chat-completion-service" /* NuidoAiSectionRole.ChatCompletionService */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect termination agent here.",
            direction: "in" /* SectionDirectionType.In */,
            role: "strategy-termination-agent" /* NuidoAiSectionRole.StrategyTerminationAgent */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect to a chat group from here.",
            direction: "out" /* SectionDirectionType.Out */,
            role: "chat-group-termination-strategy" /* NuidoAiSectionRole.ChatGroupTerminationStrategy */
        });
    }
}
