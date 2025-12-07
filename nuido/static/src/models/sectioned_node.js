/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
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
    constructor(data) {
        this.id = data.id;
        this.sectionType = data.sectionType;
        this.inPortId = data.inPortId;
        this.outPortId = data.outPortId;
        this.direction = data.direction;
    }
    getData() {
        return {
            id: this.id,
            sectionType: this.sectionType,
            direction: this.direction,
            inPortId: this.inPortId,
            outPortId: this.outPortId
        };
    }
}
export class SectionedNodeModel extends NodeModel {
    sections;
    constructor(data) {
        super(data);
        this.sections = [];
    }
    loadSection(sectionId, sectionType, dir, inPortId, outPortId) {
        const nodeSectionRegistry = registry.category(NuidoNodeSectionRegistryName).get(sectionType);
        if (nodeSectionRegistry && nodeSectionRegistry.model) {
            const section = new nodeSectionRegistry.model({
                id: sectionId,
                sectionType: sectionType,
                direction: dir,
                inPortId: inPortId,
                outPortId: outPortId
            });
            this.sections.push(section);
            return section;
        }
        else {
            throw new Error(`Section type "${sectionType}" not found in registry.`);
        }
    }
    addSection(sectionId, sectionType, options) {
        const nodeSectionRegistry = registry.category(NuidoNodeSectionRegistryName).get(sectionType);
        if (!nodeSectionRegistry || !nodeSectionRegistry.model) {
            throw new Error(`Section type "${sectionType}" not found in registry.`);
        }
        let inPortId;
        let outPortId;
        let sectionDirection = "none";
        switch (options?.direction) {
            case "in":
                inPortId = options.inPortId ?? `in-${uuidv4()}`;
                this.addInPort(inPortId, options?.portType ?? Default, options?.maxIn ?? 1, options?.portSpec ?? {});
                sectionDirection = "in";
                break;
            case "out":
                outPortId = options.outPortId ?? `out-${uuidv4()}`;
                this.addOutPort(outPortId, options?.portType ?? Default, options?.maxOut ?? 1, options?.portSpec ?? {});
                sectionDirection = "out";
                break;
            case "inout":
                inPortId = options.inPortId ?? `in-${uuidv4()}`;
                this.addInPort(inPortId, options?.portType ?? Default, options?.maxIn ?? 1, options?.portSpec ?? {});
                outPortId = options.outPortId ?? `out-${uuidv4()}`;
                this.addOutPort(outPortId, options?.portType ?? Default, options?.maxOut ?? 1, options?.portSpec ?? {});
                sectionDirection = "inout";
                break;
            default:
                sectionDirection = "none";
                break;
        }
        const section = new nodeSectionRegistry.model({
            id: sectionId,
            sectionType: sectionType,
            direction: sectionDirection,
            inPortId: inPortId,
            outPortId: outPortId
        });
        const sectionProps = omit(options, "id", "sectionType", "inPortId", "outPortId", "direction", "portType", "maxIn", "maxOut", "portSpec");
        Object.assign(section, sectionProps);
        this.sections.push(section);
        return section;
    }
    getData() {
        const baseData = super.getData();
        return {
            ...baseData,
            sections: this.sections.map(section => ({
                id: section.id,
                sectionType: section.sectionType,
                inPortId: section.inPortId,
                outPortId: section.outPortId,
                direction: section.direction,
                ...omit(section, 'id', 'sectionType', 'inPortId', 'outPortId', 'direction')
            }))
        };
    }
    toJSON() {
        let res = this.getData();
        return res;
    }
}
