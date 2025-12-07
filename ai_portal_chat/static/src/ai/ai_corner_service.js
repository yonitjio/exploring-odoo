import { Component, markRaw, reactive, xml } from "@odoo/owl";

import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";

import { AiCorner } from "./ai_corner";

class AiCornerWrapper extends Component {
    static template = xml`<t t-component="props.subComponent" t-props="props.subProps" />`;
    static props = ["*"];
}

const aiCornerService = {
    dependencies: ["overlay", "ai_chat"],

    start(env, services) {
        const subEnv = reactive({});
        const root = services.ai_chat.root

        const deactivate = () => {
            subEnv.isActive = false;
        };

        function openAiCorner(props, options = {}){
            const close = () => remove();
            subEnv.close = close;
            deactivate();

            const remove = services.overlay.add(
                AiCornerWrapper,
                {
                    subComponent: AiCorner,
                    subProps: markRaw({ ...props, close }),
                    subEnv,
                },
                {
                    onRemove: () => {
                        deactivate();
                        options.onClose?.();
                    },
                    rootId: root.id
                }
            );

            return remove;
        }

        function closeAiCorner() {
            subEnv.close();
        }

        return {
            openAiCorner,
            closeAiCorner
        };
    }
};

registry.category("services").add("ai_corner", aiCornerService);
