// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { registry } from "@web/core/registry";
import { omit } from "@web/core/utils/objects";
import { NodeModel } from "@nuido/models/node";
import { uuidv4 } from "@nuido/utils/utils";
import { Default, NuidoNodeSectionRegistryName } from "@nuido/utils/registry";
export var SectionDirectionType;
(function (SectionDirectionType) {
    SectionDirectionType["In"] = "in";
    SectionDirectionType["Out"] = "out";
    SectionDirectionType["InOut"] = "inout";
    SectionDirectionType["None"] = "none";
})(SectionDirectionType || (SectionDirectionType = {}));
export class NodeSectionModel {
    id;
    sectionType;
    inPortId;
    outPortId;
    direction;
    constructor(id, sectionType, dir, inPortId, outPortId) {
        this.id = id;
        this.sectionType = sectionType;
        this.inPortId = inPortId;
        this.outPortId = outPortId;
        this.direction = dir;
    }
}
export class SectionedNodeModel extends NodeModel {
    sections;
    constructor(...args) {
        super(...args);
        this.sections = [];
    }
    loadSection(sectionId, sectionType, dir, inPortId, outPortId) {
        let section;
        const nodeSectionRegistry = registry.category(NuidoNodeSectionRegistryName).get(sectionType);
        if (nodeSectionRegistry && nodeSectionRegistry.model) {
            section = new nodeSectionRegistry.model(sectionId, sectionType, dir, inPortId, outPortId);
            this.sections.push(section);
        }
        else {
            throw "Can't find section type in registry.";
        }
        return section;
    }
    addSection(sectionId, sectionType, options) {
        let section;
        const nodeSectionRegistry = registry.category(NuidoNodeSectionRegistryName).get(sectionType);
        if (nodeSectionRegistry && nodeSectionRegistry.model) {
            let inId;
            let outId;
            let dir;
            if (options?.direction === "in" /* SectionDirectionType.In */) {
                inId = "in-" + uuidv4();
                this.addInPort(inId, options?.portType ? options.portType : Default, options?.maxIn ? options.maxIn : 1);
                dir = "in" /* SectionDirectionType.In */;
            }
            else if (options?.direction === "out" /* SectionDirectionType.Out */) {
                outId = "out-" + uuidv4();
                this.addOutPort(outId, options?.portType ? options.portType : Default, options?.maxOut ? options.maxOut : 1);
                dir = "out" /* SectionDirectionType.Out */;
            }
            else if (options?.direction === "inout" /* SectionDirectionType.InOut */) {
                inId = "in-" + uuidv4();
                this.addInPort(inId, options?.portType ? options.portType : Default, options?.maxIn ? options.maxIn : 1);
                outId = "out-" + uuidv4();
                this.addOutPort(outId, options?.portType ? options.portType : Default, options?.maxOut ? options.maxOut : 1);
                dir = "inout" /* SectionDirectionType.InOut */;
            }
            else {
                dir = "none" /* SectionDirectionType.None */;
            }
            section = new nodeSectionRegistry.model(sectionId, sectionType, dir, inId, outId);
            const props = omit(options, "id", "sectionType", "inPortId", "outPortId", "direction", "maxIn", "maxOut");
            section = Object.assign(section, props);
            this.sections.push(section);
        }
        else {
            throw "Can't find section type in registry.";
        }
        return section;
    }
}
