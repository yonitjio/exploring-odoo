// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.

import { useState, useRef } from "@odoo/owl";

import { useMouseListeners } from "../../core/utils";
import { AiChatContainer } from "../ai_chat/ai_chat_container";

export class AiSidebar extends AiChatContainer {
    static template = "ai_chat_base.AiSidebar";
    static props = {
        ...AiChatContainer.props,
        offcanvasId: { type: String }
    }
    static MAX_WIDTH = 800;
    static INITIAL_WIDTH = 600;

    setup() {
        super.setup();

        this.containerRef = useRef("container");
        this.handleRef = useRef("handle");

        this.sizingState = useState({
            width: AiSidebar.INITIAL_WIDTH + "px",
            isResizing: false,
        });

        // #region Mouse Events
        this.onHandleMouseDown = useMouseListeners({
            onMouseDown: this.onMouseDown,
            onMouseMove: this.onMouseMove,
            onMouseUp: this.onMouseUp,
        });
        // #endregion
    }

    async onSendMessage(message, history){
        throw "Not implemented."
    }

    onBeforeSendMessage(){
        throw "Not implemented."
    }

    // #region Mouse Events
    onMouseDown(event) {
        event.preventDefault();

        if (!this.containerRef.el || !this.handleRef.el) {
            return;
        }

        this.sizingState.isResizing = true;
        const bounds = this.containerRef.el.getBoundingClientRect();
        this.refW = bounds.width;
        this.refX = event.clientX;

        document.documentElement.style.cursor = "e-resize";

        this.handleRef.el.classList.add("bg-info")
    }

    onMouseMove(event) {
        event.preventDefault();
        let width = Math.min(Math.max(this.refW + (this.refX - event.clientX), 300), AiSidebar.MAX_WIDTH);
        this.sizingState.width = `${width}px`;
    }

    onMouseUp() {
        this.sizingState.isResizing = false;
        document.documentElement.style.cursor = "default";
        this.handleRef.el.classList.remove("bg-info")
    }

    // #endregion
}
