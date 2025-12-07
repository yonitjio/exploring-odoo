/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { KeepLast } from "@web/core/utils/concurrency";
import { TagsList } from "@web/core/tags_list/tags_list";
import { ModelFieldSelectorPopover } from "@web/core/model_field_selector/model_field_selector_popover";
import { usePopover } from "@web/core/popover/popover_hook";
export class ModelFieldTags extends Component {
    static template = "nuido_flow.model-field-tags";
    static components = {
        TagsList,
        Popover: ModelFieldSelectorPopover,
    };
    static props = {
        ...Component.props,
        model: { type: String, optional: true },
        fields: Array,
        onAddField: Function,
        onDeleteField: Function,
    };
    static defaultProps = {
        model: ""
    };
    popover;
    loadPathDescription;
    keepLast;
    fieldPath;
    fieldService;
    setup() {
        super.setup();
        this.fieldService = useService("field");
        this.keepLast = new KeepLast();
        this.fieldPath = "";
        this.popover = usePopover(ModelFieldTags.components.Popover, {
            popoverClass: "o_popover_field_selector",
            onClose: async () => {
                if (this.fieldPath !== "") {
                    const path = await this.fieldService.loadPathDescription(this.props.model, this.fieldPath, true);
                    if (!path.isInvalid) {
                        this.props.onAddField({
                            label: path.displayNames.join("."),
                            value: this.fieldPath
                        });
                    }
                }
            }
        });
    }
    openPopover(event) {
        if (this.props.model !== "") {
            this.fieldPath = "";
            this.popover.open(event.currentTarget, {
                resModel: this.props.model,
                path: this.fieldPath,
                update: async (path, _fieldInfo) => {
                    this.fieldPath = path;
                },
                showSearchInput: true,
                followRelations: false,
                filter: (value) => value.searchable && value.type != "json"
                    && (this.props.fields.findIndex(o => o.value === value.name) < 0),
            });
        }
    }
    clear() {
        if (this.popover.isOpen) {
            this.popover.close();
            return;
        }
    }
    onFieldDeleted(fieldName) {
        this.props.onDeleteField(fieldName);
    }
    get tags() {
        return this.props.fields.map(({ label, value }) => ({
            id: value,
            text: label,
            onDelete: () => this.onFieldDeleted(value)
        }));
    }
}
