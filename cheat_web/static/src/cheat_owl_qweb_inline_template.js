/** @odoo-module */

import { Component, xml } from "@odoo/owl";

export class CheatOwlQwebInlineTemplate extends Component {
    static template = xml`
        <p>
            This text is in an inline template
        </p>`;
    static props = { };
}