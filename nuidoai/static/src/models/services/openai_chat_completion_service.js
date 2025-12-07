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
import { DropdownSection } from "@nuido_base/components/sections/dropdown_section";
export class OpenAiChatCompletionServiceModel extends SectionedNodeWithRoleModel {
    setup() {
        let sectionId = uuidv4();
        this.addSection(sectionId, TextInputSection.name, {
            label: "Service Id",
            default: "ai-chat",
            role: "service-id" /* NuidoAiSectionRole.ServiceId */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, TextInputSection.name, {
            label: "Base Url",
            default: "http://localhost:1234/v1",
            role: "service-base-url" /* NuidoAiSectionRole.ServiceBaseUrl */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, TextInputSection.name, {
            label: "API Key",
            default: "__NOT_USED__",
            role: "service-api-key" /* NuidoAiSectionRole.ServiceApiKey */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, DropdownSection.name, {
            label: "Model",
            default: "google/gemma-3-4b",
            options: [
                {
                    name: "Gemma 3",
                    value: "google/gemma-3-4b"
                },
                {
                    name: "QWen 2.5 7b Instruct",
                    value: "qwen2.5-7b-instruct"
                },
                {
                    name: "Meta Llama 3.1 8b instruct",
                    value: "meta-llama-3.1-8b-instruct"
                }
            ],
            role: "service-model" /* NuidoAiSectionRole.ServiceModel */
        });
        sectionId = uuidv4();
        this.addSection(sectionId, LabelSection.name, {
            label: "Connect to agents from here.",
            direction: "out" /* SectionDirectionType.Out */,
            maxOut: Number.MAX_SAFE_INTEGER,
            role: "chat-completion-service" /* NuidoAiSectionRole.ChatCompletionService */
        });
    }
}
