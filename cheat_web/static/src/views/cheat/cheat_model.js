/** @odoo-module */

import { markRaw } from "@odoo/owl";
import { KeepLast } from "@web/core/utils/concurrency";
import { Model } from "@web/model/model";
import { getFieldsSpec } from "@web/model/relational_model/utils";
import { orderByToString } from "@web/search/utils/order_by";

export class CheatModel extends Model  {
    setup(params) {
        console.log("Cheat Model - this: ", this);
        console.log("Cheat Model - setup params: ", params);

        this.keepLast = markRaw(new KeepLast());
        this.config = params;
    }

    _getNextConfig(currentConfig, params) {
        const config = Object.assign({}, currentConfig, params);
        return config;
    }

    async load(params = {}) {
        console.log("Cheat Model - load params: ", params);

        const config = this._getNextConfig(this.config, params);

        const kwargs = {
            specification: getFieldsSpec(config.activeFields, config.fields, config.context),
            offset: config.offset,
            order: orderByToString(config.orderBy),
            limit: config.limit,
            context: { ...config.context }
        };

        const { length, records } = await this.keepLast.add(
            this.orm.webSearchRead(config.resModel, config.domain, kwargs)
        );

        this.offset = config.offset;
        this.limit = config.limit;
        this.records = records;
        this.recordsLength = length;
        this.config = config;
    }
}
