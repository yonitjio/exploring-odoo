/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { NodeModel } from "@nuido/models/node";
import { AiMemoryPort } from "@nuido_flow_ai/components/ports/ai_memory_port";
export class MiniKnowledgeMemoryNodeModel extends NodeModel {
    setup() {
        const auxOutId = "aux-out-" + this.id + "-mini-knowledge-memory";
        this.addAuxOutPort(auxOutId, AiMemoryPort.name, Number.MAX_SAFE_INTEGER, {
            role: "ai-memory"
        });
    }
}
