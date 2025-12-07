/*!
 * © 2025 Yoni
 * This software is experimental and provided "as-is".
 * No guarantees, warranties, or liability are assumed.
 * See the LICENSE file included with this software for full details.
 */
import { patch } from "@web/core/utils/patch";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { N2Designer } from "@n2_ui/app/n2_designer";
import { GraphError } from "@n2_ui/utils/utils";
import { applyLayout, calculateCenteringOffset, convertToElk } from "@n2_elk/utils/elkjs_utils";
patch(N2Designer.prototype, {
    async autoLayout() {
        const elk = new ELK();
        const self = this;
        const controller = self.controller;
        const graph = controller.getCurrentGraph();
        try {
            const elkGraph = convertToElk(graph);
            console.log(JSON.parse(JSON.stringify(elkGraph, (k, v) => {
                if (k === "parent") {
                    return;
                }
                return v;
            })));
            const res = await elk.layout(elkGraph);
            const computedStyle = window.getComputedStyle(this.canvasRef.el);
            const offset = calculateCenteringOffset({
                width: res.width,
                height: res.height
            }, {
                width: parseFloat(computedStyle.width),
                height: parseFloat(computedStyle.height)
            });
            controller.startBatch("auto-layout");
            applyLayout(graph, controller, res, offset);
            controller.endBatch();
        }
        catch (error) {
            let errorMessage = "";
            if (error instanceof GraphError) {
                errorMessage = `Automatic layout failed: ${error}`;
            }
            else {
                errorMessage = `Automatic layout failed: complex layout is not supported.`;
                console.log(error);
            }
            this.dialog.add(ConfirmationDialog, {
                title: 'Error',
                body: errorMessage,
            });
        }
    }
});
