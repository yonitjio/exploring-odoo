/*!
 * © 2025 Yoni
 * This software is experimental and provided "as-is".
 * No guarantees, warranties, or liability are assumed.
 * See the LICENSE file included with this software for full details.
 */

import { RelationalModel } from "@web/model/relational_model/relational_model";
import { x2ManyCommands } from "@web/core/orm_service";
import { Domain } from "@web/core/domain";

const { DateTime } = luxon;
import { serializeDateTime } from "@web/core/l10n/dates";

export class FakerModel extends RelationalModel {
    loadCount() {
        const count = this.orm.searchCount(this.config.resModel, []);
        return count;
    }

    _getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async _toDataUrl(url) {
        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result;
                resolve(base64data);
            };
            reader.onerror = reject;
        });
    };

    async _getRandomValue(fieldInfo) {
        const mod = fieldInfo["module"];
        const met = fieldInfo["method"];
        const par = fieldInfo["params"];
        const vals = fieldInfo["values"];
        const businessHours = fieldInfo["businessHours"];

        if (vals) {
            const values = vals.trim().split(/\s*,\s*/);
            const res = values[Math.floor(Math.random() * values.length)];
            return res === 'true' || (res === 'false' ? false : res);
        } else if (mod && met) {
            try {
                // Only support avatar and url method
                if (mod === "image" && !["avatar", "url"].includes(met)) {
                    return undefined;
                }
                const objPar = par ? JSON.parse(par) : {};
                let res = this.faker[mod][met](objPar);

                if (mod === "image") {
                    res = await this._toDataUrl(res);
                    res = res.split("base64,")[1];
                } else if (res instanceof Date) {
                    while (res.getDay() === 0 || res.getDay() === 6) {
                        res = this.faker[mod][met](objPar);
                    }

                    const hour = this.faker.number.int({ min: 9, max: 17 });
                    const minute = this.faker.number.int({ min: 0, max: 59 });
                    const second = this.faker.number.int({ min: 0, max: 59 });

                    res.setHours(hour, minute, second, 0);

                    res = serializeDateTime(DateTime.fromJSDate(res));
                }
                return res;
            } catch (error) {
                console.error("Invalid JSON parameters:", par, error);
                return undefined;
            }
        }
        return undefined;
    }

    _getRandomLookupId(relResIds) {
        const res = relResIds[Math.floor(Math.random() * relResIds.length)];
        if (res && res > 0) {
            return res
        } else {
            return undefined;
        }
    }

    async _getMany2XIds(fields, independentOnly) {
        const many2XIds = {}
        const many2XFields = Object.values(fields).filter(
            (o) => ["many2one", "many2many"].includes(o.type) && (independentOnly ? !o.dep : true)
        );

        for (const activeFieldInfo of many2XFields) {
            const relResModel = activeFieldInfo.relation;
            const domain = new Domain(activeFieldInfo.domain ? activeFieldInfo.domain : []).toList();

            const key = `${relResModel}:${domain.toString()}`;
            if (this._idsMap.has(key)){
                many2XIds[relResModel] = this._idsMap.get(key);
            } else {
                const ids = await this.orm.search(relResModel, domain);
                many2XIds[relResModel] = ids;
                this._idsMap.set(key, ids);
            }
        }

        return many2XIds;
    }

    async _getValueForField(activeFieldInfo, many2XIds) {
        let res = undefined;
        if (activeFieldInfo.type === "many2one") {
            const relResIds = many2XIds[activeFieldInfo.relation];
            res = this._getRandomLookupId(relResIds)
        } else if (activeFieldInfo.type === "many2many") {
            const relResIds = many2XIds[activeFieldInfo.relation];
            res = this._getRandomLookupId(relResIds)
            res = [res]
        } else {
            const randomVal = await this._getRandomValue(activeFieldInfo);
            if (typeof randomVal !== 'undefined') {
                res = randomVal;
            }
        }

        return res;
    }

    async _generateDemoData(activeFields, many2XIds, maxChildCount) {
        const vals = {};
        let saveRec = true;
        let dependantFields = [];
        for (const [key, activeFieldInfo] of Object.entries(activeFields)) {
            if (activeFieldInfo.type === "one2many") {
                if (activeFieldInfo.related) {
                    const childActiveFields = activeFieldInfo.related.activeFields;
                    const childMany2XIds = await this._getMany2XIds(childActiveFields, true);
                    const children = [];
                    const childCount = this._getRandomInt(1, maxChildCount);
                    for (let c = 0; c < childCount; c++) {
                        const childVals = await this._generateDemoData(childActiveFields, childMany2XIds, maxChildCount);
                        if (childVals) {
                            children.push(x2ManyCommands.create(undefined, childVals));
                        }
                    }

                    if (children.length > 0) {
                        vals[key] = children;
                    }
                }
            } else if (["many2one", "many2many"].includes(activeFieldInfo.type) && activeFieldInfo.dep) {
                dependantFields.push({
                    key: key,
                    activeFieldInfo: activeFieldInfo
                });
            } else {
                const fieldValue = await this._getValueForField(activeFieldInfo, many2XIds)
                if (typeof fieldValue !== 'undefined') {
                    vals[key] = fieldValue;
                } else {
                    saveRec = false;
                    break;
                }
            }

        }

        let i = 0;
        let depLen = dependantFields.length;
        while (dependantFields.length > 0 && saveRec) {
            i++;

            let { key, activeFieldInfo } = dependantFields.shift();
            if (vals[activeFieldInfo["dep"]]) {
                const relResModel = activeFieldInfo.relation;
                const depDomain = [[activeFieldInfo["link"], "=", vals[activeFieldInfo["dep"]]]];
                let domain = depDomain;
                if (activeFieldInfo.domain) {
                    const fieldDomain = new Domain(activeFieldInfo.domain).toList();
                    domain = Domain.and(fieldDomain, depDomain).toList();
                }
                const relResIds = await this.orm.search(relResModel, domain);

                const res = this._getRandomLookupId(relResIds)
                if (res) {
                    vals[key] = res;
                }
            } else {
                dependantFields.push(activeFieldInfo)
            }

            if ((i == depLen) && (depLen == dependantFields.length)) {
                this.notification.add('Please check your view definition. Invalid dependant field detected.', {
                    title: 'Error',
                    type: 'danger',
                    sticky: true,
                });
                saveRec = false;
                break;
            } else if ((i == depLen) && (depLen != dependantFields.length)) {
                i = 0;
                depLen = dependantFields.length;
            }
        }

        if (saveRec) {
            return vals;
        } else {
            return undefined;
        }
    }

    async generateDemoData(count, maxChildCount, recordAction, recordActionMode) {
        this._idsMap = new Map();

        const resModel = this.config.resModel;
        const activeFields = this.config.activeFields;

        const many2XIds = await this._getMany2XIds(activeFields, true);

        for (let i = 0; i < count; i++) {
            const vals = await this._generateDemoData(activeFields, many2XIds, maxChildCount);
            if (vals) {
                const records = [];
                records.push(vals);
                const ids = await this.orm.create(resModel, records);
                if (recordAction) {
                    for (const id of ids) {
                        let doIt = Math.round(Math.random()) == 1;
                        if (doIt || recordActionMode === "all") {
                            await this.orm.call(resModel, recordAction, [id]);
                        }
                    }
                }
            }
        }
    }
}
