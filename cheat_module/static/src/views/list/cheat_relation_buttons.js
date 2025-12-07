/** @odoo-module */
import { useService } from "@web/core/utils/hooks";
import { registry } from '@web/core/registry';
import { ListController } from "@web/views/list/list_controller";
import { listView } from '@web/views/list/list_view';

export class CheatRelationListController extends ListController {
    setup() {
        super.setup();
        this.orm = useService("orm");
    }

    async onButtonClick() {
        const action = await this.orm.call('cheat.relation.main', 'generate_auxs', []);
        this.actionService.doAction(action);
   }
}

registry.category("views").add("cheat_relation_buttons", {
   ...listView,
   Controller: CheatRelationListController,
   buttonTemplate: "Cheat.Relation.Buttons",
});