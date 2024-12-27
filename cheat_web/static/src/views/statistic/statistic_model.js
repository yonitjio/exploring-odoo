import { KeepLast } from "@web/core/utils/concurrency";

export class StatisticModel {
    constructor(orm, resModel, fields) {
        this.orm = orm;
        this.resModel = resModel;
        this.fields = fields;
        this.keepLast = new KeepLast();

        console.log("Statistic Model - this: ", this);
    }

    async load(params) {
        console.log("Statistic Model - load params: ", params);

        const recordCount = await this.keepLast.add(
            this.orm.searchCount(this.resModel, [])
        );
        this.recordCount = recordCount;
    }
}
