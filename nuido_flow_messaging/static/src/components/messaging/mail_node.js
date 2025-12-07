// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Node } from "@nuido/components/node";
import { HtmlDialogInput } from "@nuido_base/components/dialogs/html_dialog_input";
import { RecordLookupTags } from "@nuido_flow/components/ui/record_lookup_tags";
export class MailNode extends Node {
    onTemplateChanged(value) {
        this.props.node.template = value;
    }
    get recordLookupTagsProps() {
        return {
            id: `input-${this.props.id}-tags`,
            model: "res.users",
            string: "Users",
            tags: this.props.node.email_tos,
            domain: () => [
                ["id", "not in", this.props.node.email_tos.map(o => o.id)],
                ["email", "!=", false]
            ],
            onTagAdded: (id, name) => {
                this.props.node.email_tos.push({ id, name });
                this.refreshEdges();
            },
            onTagDeleted: (id) => {
                this.props.node.email_tos = this.props.node.email_tos.filter(tag => tag.id !== id);
                this.refreshEdges();
            }
        };
    }
}
MailNode.template = "nuido_flow_messaging.mail-node";
MailNode.components = {
    ...Node.components,
    HtmlDialogInput,
    RecordLookupTags
};
