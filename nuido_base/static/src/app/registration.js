// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { NuidoNodeSectionRegistryName } from "@nuido/utils/registry";
import { TextInputSection, TextInputSectionModel } from "@nuido_base/components/sections/text_section";
import { DropdownSection, DropdownSectionModel } from "@nuido_base/components/sections/dropdown_section";
import { TextDialogInputSection, TextDialogInputSectionModel } from "@nuido_base/components/sections/text_dialog_section";
import { LabelSection, LabelSectionModel } from "@nuido_base/components/sections/label_section";
//  Node Sections
registry.category(NuidoNodeSectionRegistryName).add(LabelSection.name, {
    component: LabelSection,
    model: LabelSectionModel
});
registry.category(NuidoNodeSectionRegistryName).add(TextInputSection.name, {
    component: TextInputSection,
    model: TextInputSectionModel
});
registry.category(NuidoNodeSectionRegistryName).add(TextDialogInputSection.name, {
    component: TextDialogInputSection,
    model: TextDialogInputSectionModel
});
registry.category(NuidoNodeSectionRegistryName).add(DropdownSection.name, {
    component: DropdownSection,
    model: DropdownSectionModel
});
