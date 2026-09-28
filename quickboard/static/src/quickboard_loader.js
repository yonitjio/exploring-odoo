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
import { LazyComponent } from "@web/core/lazy_component";
import { Component, t, useProps, xml } from "@odoo/owl";
import { standardActionServiceProps } from "@web/webclient/actions/action_plugin";

class QuickboardLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
    <LazyComponent bundle="'quickboard.assets'" Component="'Quickboard'" props="this.props"/>
    `;
    props = useProps({
        ...standardActionServiceProps,
        props: t.object().optional(),
        Component: t.function().optional(),
    });
}

registry.category("actions").add("quickboard", QuickboardLoader);
