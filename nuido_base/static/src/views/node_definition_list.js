// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useService } from "@web/core/utils/hooks";
import { registry } from '@web/core/registry';
import { ListController } from "@web/views/list/list_controller";
import { listView } from '@web/views/list/list_view';
export class NuidoNodeDefinitionListController extends ListController {
    setup() {
        super.setup();
        this.orm = useService("orm");
    }
    async onNewButtonClick() {
        this.actionService.doAction({
            type: "ir.actions.client",
            tag: "NuidoStudio",
            params: {
                res_model: 'nuido_base.node.definition',
                titleField: 'title',
                jsonField: 'raw'
            },
        });
    }
}
registry.category("views").add("nuido_base_node_definition_list", {
    ...listView,
    Controller: NuidoNodeDefinitionListController,
    buttonTemplate: "nuido_base.node.definition.list.buttons",
});
