/*!
 * © 2025 Yoni
 * This software is experimental and provided "as-is".
 * No guarantees, warranties, or liability are assumed.
 * See the LICENSE file included with this software for full details.
 */

import { registry } from "@web/core/registry";

import { FakerModel } from "./faker_model";
import { FakerController } from "./faker_controller";
import { FakerArchParser } from "./faker_arch_parser";
import { FakerRenderer } from "./faker_renderer";

export const fakerView = {
    type: "faker",
    display_name: "Faker",
    Controller: FakerController,
    Renderer: FakerRenderer,
    ArchParser: FakerArchParser,
    Model: FakerModel,

    props(genericProps, view) {
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

registry.category("views").add("faker", fakerView);
