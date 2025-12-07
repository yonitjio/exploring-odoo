// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component } from "@odoo/owl";
import { JointModel } from "@nuido/models/joint";
export class Joint extends Component {
    static template = "nuido.edge-joint";
    static props = {
        joint: JointModel,
    };
    onClick(event) {
        if (!event.ctrlKey) {
            event.stopPropagation();
            event.preventDefault();
            this.env.nbus.trigger(this.env.channel + "/toggle" /* SelectionEventType.toggle */, {
                id: this.props.joint.id,
                type: "joint" /* SelectionType.joint */
            });
        }
    }
}
