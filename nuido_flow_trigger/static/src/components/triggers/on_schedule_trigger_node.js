// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
export class OnScheduleTriggerNode extends Node {
    get intervalInputId() {
        return `input-${this.props.node.id}-interval`;
    }
    get intervalTypeInputId() {
        return `input-${this.props.node.id}-interval-type`;
    }
    updateIntervalType(ev) {
        this.props.node.interval_type = ev.target.value;
    }
}
OnScheduleTriggerNode.template = "nuido_flow_trigger.on-schedule-trigger-node";
