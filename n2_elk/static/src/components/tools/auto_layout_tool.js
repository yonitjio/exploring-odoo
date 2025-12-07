/*!
 * © 2025 Yoni
 * This software is experimental and provided "as-is".
 * No guarantees, warranties, or liability are assumed.
 * See the LICENSE file included with this software for full details.
 */
import { n2ToolsRegistry } from "@n2_ui/components/tools/tools_registry";
export var KeyboardHighlightType;
(function (KeyboardHighlightType) {
    KeyboardHighlightType["AUTO_LAYOUT"] = "auto-layout";
})(KeyboardHighlightType || (KeyboardHighlightType = {}));
const autoLayoutTool = {
    sequence: 30,
    getToolbarItems: (owner) => ({
        items: [
            {
                label: "Auto Layout",
                iconUrl: "/n2_elk/static/images/magic-wand.svg",
                action: async () => await owner.autoLayout.bind(owner)(),
                disabled: () => false,
                tooltip: "Auto Layout",
                highlightKey: "auto-layout",
            }
        ]
    })
};
n2ToolsRegistry.add("n2.auto_layout", autoLayoutTool);
