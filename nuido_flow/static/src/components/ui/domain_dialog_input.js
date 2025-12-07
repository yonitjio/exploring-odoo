// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useState } from "@odoo/owl";
import { DomainSelectorDialog } from "@web/core/domain_selector_dialog/domain_selector_dialog";
import { makeReactive } from "@nuido/utils/utils";
import { useService } from "@web/core/utils/hooks";
export class DomainDialogInput extends Component {
    setup() {
        super.setup();
        this.dialog = useService("dialog");
        const state = {
            domain: this.props.domain
        };
        this.state = useState(makeReactive(this, state, (owner, data) => {
            this.props.onChanged(data.domain);
        }));
    }
    get trimmedText() {
        return this.state.domain.length > 30 ?
            this.state.domain.substring(0, 30) + '...' :
            this.state.domain;
    }
    updateDomain(domain) {
        this.state.domain = domain;
    }
    async showDomainDialog() {
        if (this.props.model && this.props.model.trim() !== "") {
            this.dialog.add(DomainSelectorDialog, {
                resModel: this.props.model,
                domain: this.props.domain,
                isDebugMode: !!this.env.debug,
                onConfirm: this.updateDomain.bind(this),
            });
        }
    }
}
DomainDialogInput.template = "nuido_flow.domain-dialog-input";
DomainDialogInput.props = {
    ...Component.props,
    id: String,
    label: String,
    model: String,
    onChanged: Function,
    domain: { type: String, optional: true }
};
DomainDialogInput.defaultProps = {
    domain: "[]"
};
