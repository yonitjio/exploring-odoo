// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { browser } from "@web/core/browser/browser";
import { Node } from "@nuido/components/node";
import { makeReactive } from "@nuido/utils/utils";
export class OnWebhookTriggerNode extends Node {
    setup() {
        super.setup();
        this.notification = useService("notification");
        const state = {
            value: this.props.node.webhook_id
        };
        this.state = useState(makeReactive(this, state, (_owner, data) => {
            this.props.node.webhook_id = data.value;
        }));
        if (this.state.value === "") {
            this.onGenerateHookIdButtonClick.bind(this)();
        }
    }
    onGenerateHookIdButtonClick() {
        this.props.node.generateHookId();
        this.state.value = this.props.node.webhook_id;
    }
    onCopyToClipboardButtonClick() {
        const url = new URL("/nuido/webhook/" + this.state.value, window.location.origin);
        browser.navigator.clipboard.writeText(url);
        this.notification.add("Hook Url copied to clipboard.", {
            sticky: false,
            title: "Info",
            type: "info"
        });
    }
    get trimmedText() {
        return this.state.value.length > 20 ?
            this.state.value.substring(0, 20) + '...' :
            this.state.value;
    }
    get webhookId() {
        return `input-${this.props.node.id}-hook-id`;
    }
}
OnWebhookTriggerNode.template = "nuido_flow_trigger.on-webhook-trigger-node";
OnWebhookTriggerNode.components = {
    ...Node.components
};
