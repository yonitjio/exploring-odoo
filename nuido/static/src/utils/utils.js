/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { reactive } from "@odoo/owl";
export function makeReactive(owner, initialState, handler = () => { }) {
    const reactiveState = reactive(initialState, () => handler(owner, reactiveState));
    handler(owner, reactiveState);
    return reactive(initialState);
}
export function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
export function removeItem(array, id) {
    const idx = array.findIndex(o => o.id === id);
    if (idx > -1) {
        const [removedItem] = array.splice(idx, 1);
        return removedItem;
    }
    return null;
}
