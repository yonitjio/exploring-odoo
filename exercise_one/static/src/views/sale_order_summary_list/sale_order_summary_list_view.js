import { registry } from "@web/core/registry";
import { SaleListView } from "@sale/views/sale_onboarding_list/sale_onboarding_list_view";
import { SaleOrderSummaryListController } from "./sale_order_summary_list_controller";

export const saleOrderSummaryListView = {
    ...SaleListView,
    Controller: SaleOrderSummaryListController,
};

registry.category("views").add("sale_order_summary_list", saleOrderSummaryListView);
