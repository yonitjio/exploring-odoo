// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, EventBus, useRef, useState, useSubEnv } from "@odoo/owl";
import { useService, useBus } from "@web/core/utils/hooks";
import { isOverlap, useMouseListener } from "@nuido/utils/utils";
import { Document } from "@nuido/components/document";
import { DebugEventType, EdgeTypeEventType, RecalculateEdgeEndpointsEventType } from "@nuido/components/events";
import { Default, DefaultAux } from "@nuido/utils/registry";
export class NuidoUi extends Component {
    static template = "nuido.nuido-ui";
    static components = { Document };
    static props = {
        nbus: { type: EventBus },
        channel: { type: String, optional: true },
        edgeType: { type: String, optional: true },
        auxEdgeType: { type: String, optional: true },
        documents: { type: (Array), optional: true },
        slots: { type: Object, optional: true }
    };
    static defaultProps = {
        channel: "nuido",
        edgeType: Default,
        auxEdgeType: DefaultAux,
        documents: []
    };
    ui;
    nodeUiRef;
    state;
    selectionState;
    startSelectionRect;
    onHandleMouseDown;
    isMoving;
    lastPointerPos;
    setup() {
        this.ui = useService("ui");
        this.nodeUiRef = useRef("nuido");
        this.onHandleMouseDown = useMouseListener({
            onMouseDown: this.onMouseDown,
            onMouseMove: this.onMouseMove,
            onMouseUp: this.onMouseUp,
        });
        this.lastPointerPos = undefined;
        this.isMoving = false;
        const nuidoEnv = {
            nbus: this.props.nbus,
            channel: this.props.channel,
            ui: {
                zoom_max: 2,
                zoom_min: 0.6,
                zoom_value: 0.1,
                last_zoom: 1,
                translateX: 0,
                translateY: 0,
                zoom: 1
            },
            documents: this.props.documents
        };
        useSubEnv(nuidoEnv);
        this.state = useState({
            env: nuidoEnv
        });
        this.selectionState = useState({
            selecting: false,
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            nodeElements: [],
            pathElements: [],
            jointElements: []
        });
        this.startSelectionRect = {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
        };
        useBus(this.state.env.nbus, this.env.channel + "/zoom_reset" /* NuidoEventType.zoom_reset */, this.zoom_reset.bind(this));
    }
    get documents() {
        return this.state.env.documents;
    }
    get currentDoc() {
        return this.state.env.documents[this.state.env.documents.length - 1];
    }
    get currentDocSessionId() {
        const currentDocId = this.currentDoc.id;
        const currentSessionId = this.currentDoc.sessionId;
        return currentDocId + "-" + currentSessionId;
    }
    deleteSelected() {
        this.state.env.nbus.trigger(this.state.env.channel + "/delete" /* DocumentEventType.delete */);
    }
    reset() {
        this.state.env.nbus.trigger(this.state.env.channel + "/reset" /* DocumentEventType.reset */);
    }
    clearSelection() {
        this.state.env.nbus.trigger(this.state.env.channel + "/clear" /* SelectionEventType.clear */);
    }
    updateEdgeType() {
        this.state.env.nbus.trigger(this.state.env.channel + EdgeTypeEventType, {
            edgeType: this.props.edgeType,
            auxEdgeType: this.props.auxEdgeType
        });
    }
    recalculateEdgeEndpoints() {
        this.state.env.nbus.trigger(this.state.env.channel + RecalculateEdgeEndpointsEventType);
    }
    onKeydown(event) {
        if (event.key === "Delete") {
            if (event.target instanceof HTMLElement) {
                if (event.target.classList.contains("nuido-root")) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.deleteSelected();
                }
            }
        }
        else if (event.key === "c" && event.ctrlKey) {
            // TODO Implement simple copy paste
        }
    }
    onMouseDown(event) {
        if (event.shiftKey) {
            const nuidoDocEl = document.getElementsByClassName("nuido-doc")[0];
            const nodeEls = nuidoDocEl.getElementsByClassName("node");
            const pathEls = nuidoDocEl.getElementsByClassName("path");
            const jointEls = nuidoDocEl.getElementsByClassName("joint");
            const pos = {
                x: event.x,
                y: event.y,
                w: 0,
                h: 0,
            };
            const sel = {
                selecting: true,
                x: event.x,
                y: event.y,
                nodeElements: nodeEls,
                pathElements: pathEls,
                jointElements: jointEls
            };
            Object.assign(this.startSelectionRect, pos);
            Object.assign(this.selectionState, sel, pos);
        }
    }
    _toggleSelections(elements, selectionType) {
        const left = this.selectionState.x;
        const top = this.selectionState.y;
        const width = this.selectionState.w;
        const height = this.selectionState.h;
        for (let i = 0; i < elements.length; i++) {
            const rect = elements[i].getBoundingClientRect();
            if (isOverlap(left, top, width, height, rect.left, rect.top, rect.width, rect.height)) {
                this.state.env.nbus.trigger(this.env.channel + "/select" /* SelectionEventType.select */, {
                    id: elements[i].id,
                    type: selectionType
                });
            }
            else {
                this.state.env.nbus.trigger(this.env.channel + "/unselect" /* SelectionEventType.unselect */, {
                    id: elements[i].id,
                    type: selectionType
                });
            }
        }
    }
    onContextMenu(event) {
        if (event.target.classList.contains("nuido-doc") ||
            event.target.classList.contains("nuido-doc-container")) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
    onMouseMove(event) {
        if (event.buttons == 2) {
            if (event.target.classList.contains("nuido-doc") ||
                event.target.classList.contains("nuido-doc-container")) {
                event.stopPropagation();
                event.preventDefault();
                if (this.lastPointerPos) {
                    if (this.isMoving || Math.hypot(event.x - this.lastPointerPos.x, event.y - this.lastPointerPos.y) >= 20) {
                        document.documentElement.style.cursor = "move";
                        this.state.env.ui.translateX = this.state.env.ui.translateX + event.movementX;
                        this.state.env.ui.translateY = this.state.env.ui.translateY + event.movementY;
                        const doc = document.querySelector(".nuido-doc");
                        doc.style.transform =
                            "translate(" +
                                this.state.env.ui.translateX +
                                "px, " +
                                this.state.env.ui.translateY +
                                "px) scale(" +
                                this.state.env.ui.zoom +
                                ")";
                        this.isMoving = true;
                    }
                }
                else {
                    this.lastPointerPos = {
                        x: event.x,
                        y: event.y
                    };
                }
            }
        }
        else if (event.shiftKey) {
            if (this.selectionState.selecting) {
                const eventRect = {
                    x: event.x > this.startSelectionRect.x ? this.startSelectionRect.x : event.x,
                    y: event.y > this.startSelectionRect.y ? this.startSelectionRect.y : event.y,
                    w: Math.abs(event.x - this.startSelectionRect.x),
                    h: Math.abs(event.y - this.startSelectionRect.y),
                };
                Object.assign(this.selectionState, eventRect);
                const nodeEls = this.selectionState.nodeElements;
                const pathEls = this.selectionState.pathElements;
                const jointEls = this.selectionState.jointElements;
                this._toggleSelections(nodeEls, "node" /* SelectionType.node */);
                this._toggleSelections(pathEls, "edge" /* SelectionType.edge */);
                this._toggleSelections(jointEls, "joint" /* SelectionType.joint */);
            }
        }
    }
    onMouseUp(event) {
        event.stopPropagation();
        event.preventDefault();
        document.documentElement.style.cursor = "default";
        this.lastPointerPos = undefined;
        this.isMoving = false;
        if (this.selectionState.selecting) {
            const pos = {
                x: 0,
                y: 0,
                w: 0,
                h: 0,
            };
            const sel = {
                selecting: false,
                nodeElements: [],
                edgeElements: [],
            };
            Object.assign(this.startSelectionRect, pos);
            Object.assign(this.selectionState, sel, pos);
        }
    }
    onWheel(event) {
        if (event.target.classList.contains("nuido-doc") ||
            event.target.classList.contains("nuido-doc-container")) {
            event.stopPropagation();
            event.preventDefault();
            if (event.ctrlKey) {
                if (event.deltaY > 0) {
                    this.zoom_out();
                }
                else {
                    this.zoom_in();
                }
            }
            else if (event.shiftKey) {
                this.scroll_horizontal(-event.deltaY);
            }
            else {
                this.scroll_vertical(-event.deltaY);
            }
        }
    }
    scroll_horizontal(delta) {
        this.state.env.ui.translateX = this.state.env.ui.translateX + delta;
        const doc = document.querySelector(".nuido-doc");
        doc.style.transform =
            "translate(" +
                this.state.env.ui.translateX +
                "px, " +
                this.state.env.ui.translateY +
                "px) scale(" +
                this.state.env.ui.zoom +
                ")";
    }
    scroll_vertical(delta) {
        this.state.env.ui.translateY = this.state.env.ui.translateY + delta;
        const doc = document.querySelector(".nuido-doc");
        doc.style.transform =
            "translate(" +
                this.state.env.ui.translateX +
                "px, " +
                this.state.env.ui.translateY +
                "px) scale(" +
                this.state.env.ui.zoom +
                ")";
    }
    change_translation() {
        this.state.env.ui.translateX = (this.state.env.ui.translateX / this.state.env.ui.last_zoom)
            * this.state.env.ui.zoom;
        this.state.env.ui.translateY = (this.state.env.ui.translateY / this.state.env.ui.last_zoom)
            * this.state.env.ui.zoom;
        this.state.env.ui.last_zoom = this.state.env.ui.zoom;
        const doc = document.querySelector(".nuido-doc");
        doc.style.transform =
            "translate(" +
                this.state.env.ui.translateX +
                "px, " +
                this.state.env.ui.translateY +
                "px) scale(" +
                this.state.env.ui.zoom +
                ")";
        this.state.env.nbus.trigger(this.state.env.channel + "/translation_changed" /* NuidoEventType.translation_changed */, {
            translateX: this.state.env.ui.translateX,
            translateY: this.state.env.ui.translateY,
            zoom: this.state.env.ui.zoom
        });
    }
    zoom_in() {
        if (this.state.env.ui.zoom < this.state.env.ui.zoom_max) {
            this.state.env.ui.zoom += this.state.env.ui.zoom_value;
            this.change_translation();
        }
    }
    zoom_out() {
        if (this.state.env.ui.zoom > this.state.env.ui.zoom_min) {
            this.state.env.ui.zoom -= this.state.env.ui.zoom_value;
            this.change_translation();
        }
    }
    zoom_reset() {
        if (this.state.env.ui.zoom != 1 || this.state.env.ui.translateX != 0 || this.state.env.ui.translateY != 0) {
            this.state.env.ui.translateX = 0;
            this.state.env.ui.translateY = 0;
            this.state.env.ui.zoom = 1;
            this.change_translation();
        }
    }
    get zoom() {
        return Math.round((this.state.env.ui.zoom + Number.EPSILON) * 100) / 100;
    }
    debug() {
        this.state.env.nbus.trigger(this.state.env.channel + DebugEventType);
    }
}
