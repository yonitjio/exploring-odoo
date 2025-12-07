// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { Default } from "@nuido/utils/registry";
export class ConditionalNodeModel extends NodeModel {
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        let outId = "out-" + this.id + "-true";
        this.addOutPort(outId, Default, 1, {
            condition: "True"
        });
        outId = "out-" + this.id + "-false";
        this.addOutPort(outId, Default, 1, {
            condition: "False"
        });
        this.condition = "True";
    }
}
