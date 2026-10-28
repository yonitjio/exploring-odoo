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
import { Component, proxy, useProps, usePlugin } from "@odoo/owl";
import { BusPlugin } from "@bus/services/bus_plugin";
import { standardQuickboardItemProps } from "@quickboard/quickboard/standard_quickboard_item_props";
import { QuickboardPlugin } from "@quickboard/quickboard/quickboard_plugin";
export class QuickboardItemBase extends Component {
    props = useProps({
        ...standardQuickboardItemProps
    });
    action;
    itemId;
    quickboard;
    odoobus;
    setup() {
        this.action = this.props.action;
        this.itemId = this.props.itemId;
        this.quickboard = proxy(usePlugin(QuickboardPlugin));
        this.odoobus = usePlugin(BusPlugin);
        this.odoobus.subscribe("quickboard_item_updated", ({ id }) => {
            this.onMessage(id);
        });
    }
    onMessage(id) {
        console.log(id);
    }
    showItemConfig(ev) {
        this._showItemConfig();
    }
    _getSpinnerOpt() {
        var opts = {
            "lines": 10,
            "length": 0,
            "width": 2,
            "radius": 4,
            "scale": 4,
            "corners": 1,
            "speed": 0.7,
            "rotate": 0,
            "animation": 'spinner-line-fade-more',
            "direction": 1,
            "color": '#7a008a',
            "fadeColor": 'transparent',
            "top": '51%',
            "left": '50%',
            "shadow": '0 0 1px transparent',
            "zIndex": 2000000000,
            "className": 'spinner',
            "position": 'absolute',
        };
        return opts;
    }
    _showItemConfig() {
        var self = this;
        this.action.doAction({
            'type': 'ir.actions.act_window',
            'name': 'Quickboard Item',
            'res_model': 'quickboard.item',
            'res_id': self.itemId,
            'views': [[false, 'form']],
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'dialog_size': 'large',
                'quick_edit': true
            }
        });
    }
}
