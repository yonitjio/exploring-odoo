import { visitXML } from "@web/core/utils/xml";
import { Field } from "@web/views/fields/field";

export class CheatArchParser {
    parseFieldNode(node, models, modelName) {
        return Field.parseFieldNode(node, models, modelName, "cheat");
    }

    parse(xmlDoc, models, modelName) {
        console.log("Cheat Arch Parser -  xmlDoc: ", xmlDoc);
        console.log("Cheat Arch Parser -  models: ", models);
        console.log("Cheat Arch Parser -  modelName: ", modelName);

        const fieldNodes = {};
        const limit = xmlDoc.getAttribute("limit") || 80;

        let display_name_field = [...xmlDoc.children].find(o => o.attributes['name'].value === "display_name");
        if (!display_name_field){
            display_name_field = document.createElement("field");
            display_name_field.setAttribute("name", "display_name");
            xmlDoc.appendChild(display_name_field);
        }

        visitXML(xmlDoc, (node) => {
            console.log("Cheat Arch Parser - node: ", node);

            if (node.tagName === "field") {
                const fieldNode = this.parseFieldNode(node, models, modelName);

                const conserveLineBreaks = node.getAttribute("conserve-line-breaks");
                fieldNode.conserveLineBreaks = conserveLineBreaks === 'true';
                fieldNodes[fieldNode.name] = fieldNode;
            }
        });

        return {
            fieldNodes,
            limit
        };
    }
}
