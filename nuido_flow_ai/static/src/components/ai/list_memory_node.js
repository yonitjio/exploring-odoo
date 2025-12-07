/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { useState } from "@odoo/owl";
import { Node } from "@nuido/components/node";
export class ListMemoryNode extends Node {
    static template = "nuido_flow_ai.list-memory-node";
    state;
    setup() {
        super.setup();
        this.state = useState({
            memory: ""
        });
    }
    resetMemoryState() {
        this.state.memory = "";
    }
    onAddMemory() {
        if (this.state.memory !== "") {
            this.props.node.addMemory(this.state.memory);
            this.refreshEdges();
            this.resetMemoryState();
        }
    }
    onRemoveMemory(index) {
        this.props.node.removeMemory(index);
        this.refreshEdges();
    }
    get memoryId() {
        return `input-${this.props.node.id}}-memory`;
    }
}
