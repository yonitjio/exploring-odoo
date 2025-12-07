// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useRef } from "@odoo/owl";
import { useMovable } from "@nuido/utils/utils";
export class MenuItem extends Component {
    setup() {
        this.rootRef = useRef("root");
        useMovable({
            ref: this.rootRef,
            elements: ".menu-item",
            onDrop: ({ x, y }) => {
                const doc = document.querySelector(".nuido-doc");
                const docRect = doc.getBoundingClientRect();
                const docParent = document.querySelector(".nuido-doc-container");
                const docRectParent = docParent.getBoundingClientRect();
                const docX = (x - docRect.left) / this.env.ui.zoom;
                const docY = (y - docRect.top) / this.env.ui.zoom;
                if (this._contains(docRectParent.left, docRectParent.top, docRectParent.width, docRectParent.height, x, y)) {
                    this.props.action(this.props.icon, this.props.title, this.props.type, docX, docY);
                }
            }
        });
    }
    _contains(x1, y1, w, h, x, y) {
        return (x1 <= x) && (x <= (x1 + w)) && (y1 <= y) && y <= (y1 + h);
    }
}
MenuItem.template = "nuido_base.menu-item";
MenuItem.props = {
    title: String,
    icon: String,
    type: String,
    action: Function,
};
