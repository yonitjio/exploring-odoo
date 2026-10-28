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
import { Component, t, useProps, xml } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { cookie } from "@web/core/browser/cookie";
import { LazyComponent } from "@web/core/lazy_component";
import { standardActionServiceProps } from "@web/webclient/actions/action_plugin";
class QuickboardLoader extends Component {
    static components = { LazyComponent };
    static template = xml `
    <t t-if="this.color_scheme == 'dark'">
        <LazyComponent bundle="'quickboard.dark_assets'" Component="'Quickboard'" props="this.props"/>
    </t>
    <t t-else="">
        <LazyComponent bundle="'quickboard.light_assets'" Component="'Quickboard'" props="this.props"/>
    </t>
    `;
    props = useProps({
        ...standardActionServiceProps,
        props: t.object().optional(),
        Component: t.function().optional(),
    });
    get color_scheme() {
        return cookie.get("color_scheme");
    }
}
registry.category("actions").add("quickboard", QuickboardLoader);
