// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component } from "@odoo/owl";
import { PathModel } from "@nuido/models/path";
export class Path extends Component {
    static template = "nuido.edge-path";
    static props = {
        path: PathModel,
    };
}
