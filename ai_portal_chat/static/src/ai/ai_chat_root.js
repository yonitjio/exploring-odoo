import { Component, xml } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { OverlayContainer } from "@web/core/overlay/overlay_container";

import { AIChatButton } from "./ai_chat_button";

export class AIChatRoot extends Component {
    static template = xml`
        <AIChatButton/>
        <OverlayContainer overlays="overlayService.overlays"/>
    `;
    static components = { AIChatButton, OverlayContainer };
    static props = {};

    setup() {
        this.overlayService = useService("overlay");
    }
}
