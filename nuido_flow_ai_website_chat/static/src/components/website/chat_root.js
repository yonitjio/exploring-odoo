/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { Component, xml } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { OverlayContainer } from "@web/core/overlay/overlay_container";
import { ChatButton } from "./chat_button";
export class NuidoFlowAIWebsiteChatRoot extends Component {
    static template = xml `
        <ChatButton/>
        <OverlayContainer overlays="overlayService.overlays"/>
    `;
    static components = { ChatButton, OverlayContainer };
    static props = {};
    overlayService;
    setup() {
        this.overlayService = useService("overlay");
    }
}
