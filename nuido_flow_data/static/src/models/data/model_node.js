// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { SpecAwareNodeModel } from "@nuido/models/spec_aware_node";
export class ModelNodeModel extends SpecAwareNodeModel {
    setup() {
        this.model = "";
        this.model_description = "";
    }
}
