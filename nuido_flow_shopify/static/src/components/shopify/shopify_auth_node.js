// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
import { TextInputDialogInput } from "@nuido_base/components/dialogs/text_input_dialog_input";
export class ShopifyAuthNode extends Node {
    onSecretChanged(value) {
        this.props.node.secret = value;
    }
    onRaiseErrorChanged() {
        if (this.props.node.raise_error) {
            this.props.node.raise_error = false;
        }
        else {
            this.props.node.raise_error = true;
        }
    }
    get raiseErrorInputId() {
        return `label-${this.props.node.id}-raise-error`;
    }
}
ShopifyAuthNode.template = "nuido_flow_shopify.shopify-auth-node";
ShopifyAuthNode.components = {
    ...Node.components,
    TextInputDialogInput
};
