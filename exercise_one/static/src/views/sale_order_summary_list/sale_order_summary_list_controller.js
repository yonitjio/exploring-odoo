/** @odoo-module **/
import { Domain } from "@web/core/domain";
import { useService } from "@web/core/utils/hooks";
import { FileUploadListController } from "@account/views/file_upload_list/file_upload_list_controller";

import { SaleOrderSummaryDialog } from "../../core/dialog/sale_order_summary_dialog";

export class SaleOrderSummaryListController extends FileUploadListController {
    static template = "exercise_one.SaleOrderSummaryListController";

    setup(){
        super.setup();
        this.dialog = useService("dialog");
        this.orm = useService("orm");
    }

    async onSummaryClick(){
        let domain;
        if (this.model.root.isDomainSelected) {
            domain = new Domain(this.model.config.domain).toList(this.model.root.evalContext);
        } else {
            const resIds = this.model.root.selection.map((o) => o.resId);
            domain = new Domain([["id", "in", resIds]]).toList(this.model.root.evalContext);
        }
        const res = await this.orm.call("sale.order", "get_summary", [], {
            domain: domain
        });

        this.dialog.add(SaleOrderSummaryDialog, {
            data: res.result,
            confirm: () => {
                this.discardSelection();
            }
        });
    }
};
