// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, useRef } from "@odoo/owl";
import { useMovable } from "@nuido/utils/utils";
export class DemoNodeMenu extends Component {
    static template = "nuido_demo.demo-node-menu";
    static props = {
        title: { type: String, optional: true },
        icon: { type: String, optional: true },
        action: Function,
    };
    rootRef;
    setup() {
        this.rootRef = useRef("root");
        useMovable({
            ref: this.rootRef,
            elements: ".demo-node-menu-container",
            onDrop: ({ x, y }) => {
                const doc = document.querySelector(".nuido-doc");
                const docRect = doc.getBoundingClientRect();
                const docParent = document.querySelector(".nuido-doc-container");
                const docRectParent = docParent.getBoundingClientRect();
                const docX = (x - docRect.left) / this.env.ui.zoom;
                const docY = (y - docRect.top) / this.env.ui.zoom;
                if (this._contains(docRectParent.left, docRectParent.top, docRectParent.width, docRectParent.height, x, y)) {
                    this.props.action(docX, docY);
                }
            }
        });
    }
    _contains(x1, y1, w, h, x, y) {
        return (x1 <= x) && (x <= (x1 + w)) && (y1 <= y) && y <= (y1 + h);
    }
}
