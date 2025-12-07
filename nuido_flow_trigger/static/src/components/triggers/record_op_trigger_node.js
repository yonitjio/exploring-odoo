// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { onMounted, onWillUnmount } from "@odoo/owl";
import { Node } from "@nuido/components/node";
import { DocumentDataUpdatedEventType } from "@nuido_flow_trigger/components/triggers/events";
export class OnRecordOperationTriggerNode extends Node {
    setup() {
        super.setup();
        onMounted(() => {
            this._updateCurrentDocData();
        });
        onWillUnmount(() => {
            this.props.node.model = "";
            this.props.node.model_description = "";
            this._updateCurrentDocData();
        });
    }
    _updateCurrentDocData() {
        const currentDoc = this.env.documents[this.env.documents.length - 1];
        Object.assign(currentDoc.data, {
            activeModel: this.props.node.model,
            activeModelDisplayName: this.props.node.model_description
        });
        this.env.nbus.trigger(this.env.channel + DocumentDataUpdatedEventType);
    }
}
