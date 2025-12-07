// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { NodeModel } from "@nuido/models/node";
import { AiMcpPort } from "@nuido_flow_ai/components/ports/ai_mcp_port";
export class FetchAiMcpNodeModel extends NodeModel {
    setup() {
        const auxOutId = "aux-out-" + this.id + "-fetch-ai-mcp";
        this.addAuxOutPort(auxOutId, AiMcpPort.name, Number.MAX_SAFE_INTEGER, {
            role: "ai-mcp"
        });
    }
}
