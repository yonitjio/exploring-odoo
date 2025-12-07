// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useRef } from "@odoo/owl";
import { useBus } from "@web/core/utils/hooks";
import { useDebounced } from "@web/core/utils/timing";
import { registry } from "@web/core/registry";
import { NuidoPortRegistryName } from "@nuido/utils/registry";
import { useDraggable } from "@nuido/utils/utils";
import { NodeModel } from "@nuido/models/node";
import { DebugEventType, NodeMovedEventType, RecalculateEdgeEndpointsEventType } from "@nuido/components/events";
import { Port } from "@nuido/components/port";
export class Node extends Component {
    static template = "nuido.node";
    static components = { Port };
    static props = {
        node: NodeModel
    };
    ui;
    rootRef;
    setup() {
        this.rootRef = useRef("root");
        useDraggable({
            ref: this.rootRef,
            handle: ".node-title",
            elements: ".node-container",
            onWillStartDrag: ({ element: ctx, getRect, x, y }) => {
                const elRect = getRect(ctx);
                const docRect = getRect(ctx.closest(".nuido-doc"));
                const left = elRect.left - docRect.left;
                const top = elRect.top - docRect.top;
                ctx.startLeft = left / this.env.ui.zoom;
                ctx.startTop = top / this.env.ui.zoom;
                ctx.startPointerX = x;
                ctx.startPointerY = y;
                ctx.lastPointerX = x;
                ctx.lastPointerY = y;
            },
            onDrag: ({ element: ctx, x, y }) => {
                const deltaX = (x - ctx.startPointerX) / this.env.ui.zoom;
                const deltaY = (y - ctx.startPointerY) / this.env.ui.zoom;
                const left = (ctx.startLeft + deltaX);
                const top = (ctx.startTop + deltaY);
                const trueDeltaX = (x - ctx.lastPointerX) / this.env.ui.zoom;
                const trueDeltaY = (y - ctx.lastPointerY) / this.env.ui.zoom;
                ctx.lastPointerX = x;
                ctx.lastPointerY = y;
                ctx.style.left = `${left}px`;
                ctx.style.top = `${top}px`;
                this.notifyUpdate(trueDeltaX, trueDeltaY);
            },
        });
        this.refreshEdges = useDebounced(this.refreshEdges, 20);
        useBus(this.env.nbus, this.env.channel + DebugEventType, this.onDebug.bind(this));
    }
    refreshEdges() {
        const ports = this.props.node.getPorts();
        for (let i = 0; i < ports.length; i++) {
            this.env.nbus.trigger(this.env.channel + RecalculateEdgeEndpointsEventType, {
                id: ports[i].id
            });
        }
    }
    notifyUpdate(deltaX = 0, deltaY = 0) {
        const node = this.props.node;
        node.move(deltaX, deltaY);
        this.env.nbus.trigger(this.env.channel + NodeMovedEventType, {
            id: this.props.node.id,
            x: deltaX,
            y: deltaY
        });
    }
    onClick(event) {
        this.env.nbus.trigger(this.env.channel + "/toggle" /* SelectionEventType.toggle */, {
            id: this.props.node.id,
            type: "node" /* SelectionType.node */
        });
    }
    onMouseMove(event) {
    }
    getPortComponent(portModel) {
        const portRegistry = registry.category(NuidoPortRegistryName).get(portModel.portType);
        return portRegistry.component;
    }
    onDebug(event) {
        console.log("debug");
    }
}
