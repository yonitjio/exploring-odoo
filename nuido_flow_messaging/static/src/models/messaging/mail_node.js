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
import { Default } from "@nuido/utils/registry";
export class MailNodeModel extends NodeModel {
    subject;
    template;
    email_tos;
    setup() {
        const inId = "in-" + this.id + "-1";
        this.addInPort(inId, Default, 1);
        const outId = "out-" + this.id + "-1";
        this.addOutPort(outId, Default, 1);
        this.subject = "";
        this.template = "";
        this.email_tos = [];
    }
    getData() {
        const res = super.getData();
        return Object.assign(res, {
            subject: this.subject,
            template: this.template,
            email_tos: this.email_tos
        });
    }
}
