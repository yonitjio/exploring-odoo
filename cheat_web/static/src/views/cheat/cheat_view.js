import { registry } from "@web/core/registry";
import { CheatModel } from "./cheat_model";
import { CheatController } from "./cheat_controller";
import { CheatArchParser } from "./cheat_arch_parser";
import { CheatRenderer } from "./cheat_renderer";

export const cheatView = {
    type: "cheat",
    searchMenuTypes: ["filter", "favorite"],
    Controller: CheatController,
    Renderer: CheatRenderer,
    Model: CheatModel,
    ArchParser: CheatArchParser,

    props(genericProps, view) {
        console.log("Cheat View - this: ", this);
        console.log("Cheat View - genericProps: ", genericProps);
        console.log("Cheat View - view: ", view);

        const { ArchParser } = view;
        const { arch, relatedModels, resModel } = genericProps;
        const archInfo = new ArchParser().parse(arch, relatedModels, resModel);

        return {
            ...genericProps,
            Model: view.Model,
            Renderer: view.Renderer,
            archInfo,
        };
    },
};

registry.category("views").add("cheat", cheatView);
