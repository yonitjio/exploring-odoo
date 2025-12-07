// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState } from "@odoo/owl";
import { makeReactive } from "@nuido/utils/utils";
import { NodeSection } from "@nuido/components/node_section";
import { NodeSectionWithRoleModel } from "@nuido_base/models/sections/node_section_with_role";
export class DropdownSectionModel extends NodeSectionWithRoleModel {
    constructor() {
        super(...arguments);
        this.label = "Input";
        this.options = [];
    }
}
export class DropdownSection extends NodeSection {
    setup() {
        super.setup();
        const state = {
            value: this.props.section.value || this.props.section.default || ""
        };
        this.state = useState(makeReactive(this, state, (owner, data) => {
            this.props.section.value = data.value;
        }));
    }
}
DropdownSection.template = "nuido_base.dropdown-input-section";
