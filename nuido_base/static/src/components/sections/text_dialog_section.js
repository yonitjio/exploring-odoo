// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState } from "@odoo/owl";
import { makeReactive } from "@nuido/utils/utils";
import { useService } from "@web/core/utils/hooks";
import { NodeSection } from "@nuido/components/node_section";
import { TextDialog } from "@nuido_base/components/dialogs/text_dialog";
import { NodeSectionWithRoleModel } from "@nuido_base/models/sections/node_section_with_role";
export class TextDialogInputSectionModel extends NodeSectionWithRoleModel {
    constructor() {
        super(...arguments);
        this.label = "Input";
    }
}
export class TextDialogInputSection extends NodeSection {
    setup() {
        super.setup();
        this.dialog = useService("dialog");
        const state = {
            value: this.props.section.value || this.props.section.default || ""
        };
        this.state = useState(makeReactive(this, state, (owner, data) => {
            this.props.section.value = data.value;
        }));
    }
    get trimmedText() {
        return this.state.value.length > 30 ?
            this.state.value.substring(0, 30) + '...' :
            this.state.value;
    }
    updateText(value) {
        this.state.value = value;
    }
    async showTextDialog() {
        this.dialog.add(TextDialog, {
            title: this.props.section.label,
            initialValue: this.props.section.value,
            apply: this.updateText.bind(this)
        });
    }
}
TextDialogInputSection.template = "nuido_base.text-dialog-input-section";
