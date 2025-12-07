// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { Many2XAutocomplete } from "@web/views/fields/relational_utils";
import { TagsList } from "@web/core/tags_list/tags_list";
export class RecordLookupTags extends Component {
    setup() {
        super.setup();
        this.orm = useService("orm");
        this.state = useState({
            recordId: -1,
            recordName: "",
        });
    }
    get many2XAutocompleteProps() {
        return {
            id: this.props.id,
            resModel: this.props.model,
            fieldString: this.props.string,
            autoSelect: true,
            activeActions: {
                create: false,
                createEdit: false,
                write: false,
            },
            context: this.props.context || {},
            placeholder: this.props.placeholder || "",
            update: async (o) => {
                const id = o[0]["id"];
                const fields = ["display_name"];
                const records = await this.orm.read(this.props.model, [id], fields, {
                    context: this.props.context || {},
                });
                this.props.onTagAdded(id, records[0]["display_name"]);
            },
            getDomain: this.props.domain ? this.props.domain : () => { []; }
        };
    }
    get tags() {
        return this.props.tags.map(({ id, name }) => ({
            id: id,
            text: name,
            onDelete: () => this.props.onTagDeleted(id)
        }));
    }
}
RecordLookupTags.template = "nuido_flow.record-lookup-tags";
RecordLookupTags.components = {
    TagsList,
    Many2XAutocomplete,
};
RecordLookupTags.props = {
    ...Component.props,
    model: String,
    string: String,
    id: { type: String, optional: true },
    domain: { type: [Array, Function], optional: true },
    context: { type: Object, optional: true },
    placeholder: { type: String, optional: true },
    tags: Array,
    onTagAdded: Function,
    onTagDeleted: Function,
};
