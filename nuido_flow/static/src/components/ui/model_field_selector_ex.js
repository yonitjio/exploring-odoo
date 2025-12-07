// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { ModelFieldSelector } from "@web/core/model_field_selector/model_field_selector";
export class ModelFieldSelectorEx extends ModelFieldSelector {
    async updateState(params, isConcurrent) {
        const { resModel, path, allowEmpty } = params;
        if (resModel) {
            await super.updateState(params, isConcurrent);
        }
        else {
            this.clear();
        }
    }
    clear() {
        super.clear();
        Object.assign(this.state, { isInvalid: false, displayNames: [] });
    }
}
