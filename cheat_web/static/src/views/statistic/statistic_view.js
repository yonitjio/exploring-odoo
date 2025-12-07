import { registry } from "@web/core/registry";
import { StatisticModel } from "./statistic_model";
import { StatisticController } from "./statistic_controller";
import { StatisticRenderer } from "./statistic_renderer";

export const statisticView = {
    type: "statistic",
    Controller: StatisticController,
    Renderer: StatisticRenderer,
    Model: StatisticModel,

    props(genericProps, view) {
        console.log("Statistic View - this: ", this);
        console.log("Statistic View - genericProps: ", genericProps);
        console.log("Statistic View - view: ", view);

        return {
            ...genericProps,
            Model: view.Model,
            Renderer: view.Renderer
        };
    },
};

registry.category("views").add("statistic", statisticView);
