// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { ModelSelector } from "@web/core/model_selector/model_selector";
export class ModelSelectorEx extends ModelSelector {
    onChange(event) {
        if (event.inputValue === '') {
            // @ts-ignore
            this.props.onModelSelected({
                label: "",
                value: "",
            });
        }
    }
}
ModelSelectorEx.template = "nuido_flow.ModelSelectorEx";
ModelSelectorEx.props = {
    ...ModelSelector.props,
};
