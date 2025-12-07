/** @odoo-module **/
import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class QuickboardItemBase extends Component {
    setup() {
        this.itemId = this.props.itemId;
        this.dialog = this.props.dialogService;
        this.action = this.props.actionService;

        this.quickboard = useState(useService("quickboard"));

        this.busService = this.env.services.bus_service;
        this.busService.subscribe("quickboard_item_updated", ({ id }) => {
            this.onMessage(id)
        });
    }

    onMessage(id) {
        console.log(id);
    }

    showItemConfig(ev) {
        this._showItemConfig();
    }

    _getSpinnerOpt(){
        var opts = {
            "lines": 10, // The number of lines to draw
            "length": 0, // The length of each line
            "width": 2, // The line thickness
            "radius": 4, // The radius of the inner circle
            "scale": 4, // Scales overall size of the spinner
            "corners": 1, // Corner roundness (0..1)
            "speed": 0.7, // Rounds per second
            "rotate": 0, // The rotation offset
            "animation": 'spinner-line-fade-more', // The CSS animation name for the lines
            "direction": 1, // 1: clockwise, -1: counterclockwise
            "color": '#7a008a', // CSS color or array of colors
            "fadeColor": 'transparent', // CSS color or array of colors
            "top": '51%', // Top position relative to parent
            "left": '50%', // Left position relative to parent
            "shadow": '0 0 1px transparent', // Box-shadow for the lines
            "zIndex": 2000000000, // The z-index (defaults to 2e9)
            "className": 'spinner', // The CSS class to assign to the spinner
            "position": 'absolute', // Element positioning
          };

        return opts;
    }

    _showItemConfig(){
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
                'dialog_size': 'medium',
                'quick_edit': true
            }
        });
    }
}