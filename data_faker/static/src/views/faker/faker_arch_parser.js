/*!
 * © 2025 Yoni
 * This software is experimental and provided "as-is".
 * No guarantees, warranties, or liability are assumed.
 * See the LICENSE file included with this software for full details.
 */

import { visitXML } from "@web/core/utils/xml";
import { Field } from "@web/views/fields/field";

export class FakerArchParser {
    parseRelationNode(node, models, modelName) {
        const name = node.getAttribute("name");
        const fields = models[modelName].fields;
        const relationInfo = {
            resModel: fields[name].relation,
            resField: fields[name].relation_field
        };

        return relationInfo;
    }

    parse(xmlDoc, models, modelName) {
        const fieldNodes = {};
        const fakerInfo = {};

        visitXML(xmlDoc, (node) => {
            if (node.tagName === "field") {
                node.setAttribute("mode", "faker");

                const fieldNode = Field.parseFieldNode(node, models, modelName, "faker");

                fieldNode.module = node.getAttribute("module");
                fieldNode.method = node.getAttribute("method");
                fieldNode.params = node.getAttribute("params");
                fieldNode.values = node.getAttribute("values");
                fieldNode.businessHours = node.getAttribute("business-hours");
                fieldNode.dep = node.getAttribute("dep");
                fieldNode.link = node.getAttribute("link");
                fieldNode.domain = node.getAttribute("domain");
                fieldNodes[fieldNode.name] = fieldNode;
                return false;
            } else if (node.tagName === "faker"){
                fakerInfo.recordAction = node.getAttribute("record-action");

                const recordActionMode = node.getAttribute("record-action-mode");
                fakerInfo.recordActionMode = recordActionMode ? recordActionMode : "random";

                const recordMaxCount = node.getAttribute("record-max-count");
                fakerInfo.recordMaxCount = recordMaxCount ? recordMaxCount : 100;
            }
        });

        return {
            fieldNodes,
            ...fakerInfo
        };
    }
}
