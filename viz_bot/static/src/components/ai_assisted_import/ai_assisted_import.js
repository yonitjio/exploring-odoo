/** @odoo-module */
import { ListController } from "@web/views/list/list_controller";
import { registry } from '@web/core/registry';
import { listView } from '@web/views/list/list_view';

export class PurchaseListController extends ListController {
   setup() {
      super.setup();
   }
   
   onImportFromImageClick() {
       this.actionService.doAction({
          type: 'ir.actions.act_window',
          res_model: 'vizbot.ai.import.purchase',
          name:'Import from Image',
          view_mode: 'form',
          view_type: 'form',
          views: [[false, 'form']],
          target: 'new',
      });
   }
}

registry.category("views").add("ai_assisted_import_purchase", {
   ...listView,
   Controller: PurchaseListController,
   buttonTemplate: "viz_bot.ListView.Buttons",
});