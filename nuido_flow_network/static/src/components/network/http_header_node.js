// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { useState } from "@odoo/owl";
import { Node } from "@nuido/components/node";
export class HttpHeaderNode extends Node {
    setup() {
        super.setup();
        this.state = useState({
            headerName: "",
            headerValue: "",
            isMaskValue: true
        });
    }
    resetHeaderState() {
        this.state.headerName = "";
        this.state.headerValue = "";
    }
    onAddHeader() {
        if (this.state.headerName !== "" && this.state.headerValue !== "") {
            this.props.node.addOrUpdateHeader(this.state.headerName, this.state.headerValue, this.state.isMaskValue);
            this.refreshEdges();
            this.resetHeaderState();
        }
    }
    onRemoveHeader(name) {
        this.props.node.removeHeader(name);
        this.refreshEdges();
    }
    onIsMaskValueChanged() {
        if (this.state.isMaskValue) {
            this.state.isMaskValue = false;
        }
        else {
            this.state.isMaskValue = true;
        }
    }
    get headerValueId() {
        return `input-${this.props.node.id}}-header-value`;
    }
    get headerValueInputType() {
        return this.state.isMaskValue ? "password" : "text";
    }
    get headerNameId() {
        return `input-${this.props.node.id}}-header-name`;
    }
    get isMaskValueInputId() {
        return `input-${this.props.node.id}}-mask-value`;
    }
}
HttpHeaderNode.template = "nuido_flow_data.http-header-node";
