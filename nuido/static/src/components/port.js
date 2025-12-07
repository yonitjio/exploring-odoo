// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useRef } from "@odoo/owl";
import { useBus } from "@web/core/utils/hooks";
import { AdjustEdgeEndpointEventType, DebugEventType, RecalculateEdgeEndpointsEventType } from "@nuido/components/events";
import { PortModel } from "@nuido/models/port";
export class Port extends Component {
    static template = "nuido.port";
    static props = {
        port: PortModel
    };
    rootRef;
    setup() {
        this.rootRef = useRef("root");
        useBus(this.env.nbus, this.env.channel + RecalculateEdgeEndpointsEventType, this.onRecalculateEdgeEndpoints.bind(this));
        useBus(this.env.nbus, this.env.channel + DebugEventType, this.onDebug.bind(this));
    }
    get cssClass() {
        let css = 'port my-2';
        css = css + ' ' + this.props.port.id;
        if (this.props.port.direction === "aux-in" /* PortDirection.auxIn */ || this.props.port.direction === "aux-out" /* PortDirection.auxOut */) {
            css = css + ' mx-2';
        }
        css = css + ' ' + this.props.port.direction;
        return css;
    }
    onMouseDown(event) {
        if ((this.props.port.direction === "output" /* PortDirection.out */ || this.props.port.direction === "aux-out" /* PortDirection.auxOut */)
            && this.props.port.canAddLink()) {
            const docElement = document.querySelector(".nuido-doc");
            const docRect = docElement.getBoundingClientRect();
            const elRect = event.target.getBoundingClientRect();
            const x = ((elRect.left - docRect.left) + elRect.width / 2) / this.env.ui.zoom;
            const y = ((elRect.top - docRect.top) + elRect.height / 2) / this.env.ui.zoom;
            this.env.nbus.trigger(this.env.channel + "/edge-start" /* NewEdgeEventType.start */, {
                id: this.props.port.id,
                direction: this.props.port.direction,
                nodeId: this.props.port.nodeId,
                x: x,
                y: y
            });
        }
    }
    onMouseUp(event) {
        if ((this.props.port.direction === "input" /* PortDirection.in */ || this.props.port.direction === "aux-in" /* PortDirection.auxIn */)
            && this.props.port.canAddLink()) {
            const docElement = document.querySelector(".nuido-doc");
            const docRect = docElement.getBoundingClientRect();
            const elRect = event.target.getBoundingClientRect();
            const x = ((elRect.left - docRect.left) + elRect.width / 2) / this.env.ui.zoom;
            const y = ((elRect.top - docRect.top) + elRect.height / 2) / this.env.ui.zoom;
            this.env.nbus.trigger(this.env.channel + "/edge-end" /* NewEdgeEventType.end */, {
                id: this.props.port.id,
                direction: this.props.port.direction,
                nodeId: this.props.port.nodeId,
                x: x,
                y: y
            });
        }
    }
    onContextMenu(event) {
    }
    onRecalculateEdgeEndpoints(event) {
        if (event.detail) {
            if (event.detail.id !== this.props.port.id) {
                return;
            }
        }
        const docElement = document.querySelector(".nuido-doc");
        const docRect = docElement.getBoundingClientRect();
        const elRect = this.rootRef.el.getBoundingClientRect();
        const x = ((elRect.left - docRect.left) + elRect.width / 2) / this.env.ui.zoom;
        const y = ((elRect.top - docRect.top) + elRect.height / 2) / this.env.ui.zoom;
        this.env.nbus.trigger(this.env.channel + AdjustEdgeEndpointEventType, {
            id: this.props.port.id,
            direction: this.props.port.direction,
            nodeId: this.props.port.nodeId,
            x: x,
            y: y
        });
    }
    onDebug(event) {
        console.log("debug");
    }
}
