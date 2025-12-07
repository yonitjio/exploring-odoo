/*!
 * THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
 *
 * This software is released under the MIT License.
 * SPDX-License-Identifier: MIT
 * https://opensource.org/licenses/MIT
 *
 * THIS SOFTWARE IS EXPERIMENTAL, NO GUARANTEES OR LIABILITY ASSUMED.
 *
 */

import { registry } from "@web/core/registry";
import { LazyComponent } from "@web/core/assets";
import { Component, xml } from "@odoo/owl";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";

class QuickboardLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
    <LazyComponent bundle="'quickboard.assets'" Component="'Quickboard'" props="props"/>
    `;
    static props = {
        ...standardActionServiceProps,
        props: { type: Object, optional: true },
        Component: { type: Function, optional: true },
    };
}

registry.category("actions").add("quickboard", QuickboardLoader);
