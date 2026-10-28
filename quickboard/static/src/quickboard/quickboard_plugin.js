/*!
 * THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
 *
 * This software is released under the MIT License.
 * SPDX-License-Identifier: MIT
 * https://opensource.org/licenses/MIT
 *
 * THIS SOFTWARE IS EXPERIMENTAL, NO GUARANTEES OR LIABILITY ASSUMED.
 *
 */
import { Plugin } from "@odoo/owl";
import { proxy } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";
export class QuickboardPlugin extends Plugin {
    board = proxy({
        items: {},
        isReady: false
    });
    async getQuickboardItemDefs(boardId) {
        this.board.isReady = false;
        this.board.items = {};
        const updates = await rpc("/quickboard/item_defs", { board_id: boardId });
        Object.assign(this.board.items, updates);
        this.board.isReady = true;
    }
    ;
    async getQuickboardItem(itemId, startDate, endDate) {
        return await rpc("/quickboard/item", {
            item_id: itemId,
            start_date: startDate.toSQLDate(),
            end_date: endDate.toSQLDate()
        });
    }
    ;
    async saveLayout(layout) {
        await rpc("/quickboard/save_layout", {
            "layout": layout
        });
    }
    ;
    async saveFilter(startDate, endDate) {
        return await rpc("/quickboard/save_filter", {
            start_date: startDate.toSQLDate(),
            end_date: endDate.toSQLDate()
        });
    }
    ;
    async saveTheme(theme) {
        return await rpc("/quickboard/save_theme", {
            theme: theme
        });
    }
    ;
}
;
