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
import { Component, signal, proxy, onPatched, useProps, usePlugin, useOnChange, providePlugins, onWillStart, onMounted } from "@odoo/owl";
import { standardActionServiceProps } from "@web/webclient/actions/action_plugin";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { user } from "@web/core/user";
import { deserializeDateTime, serializeDateTime } from "@web/core/l10n/dates";
import { ORM } from "@web/core/orm_plugin";
import { DialogPlugin } from "@web/core/dialog/dialog_plugin";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";
import { BusPlugin } from "@bus/services/bus_plugin";
import { DateTimeInput } from "@web/core/datetime/datetime_input";
import { SelectMenu } from "@web/core/select_menu/select_menu";
import { RecordSelector } from "@web/core/record_selectors/record_selector";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { QuickboardItem } from "@quickboard/quickboard/quickboard_item";
import { QUICKBOARD_BG_COLORS } from "@quickboard/core/colors";
import { QuickboardPlugin } from "./quickboard_plugin";
const { DateTime } = luxon;
class Quickboard extends Component {
    static template = "quickboard";
    static components = { SelectMenu, DateTimeInput, RecordSelector, QuickboardItem };
    props = useProps({
        ...standardActionServiceProps,
    });
    odoobus;
    orm;
    dialog;
    action;
    quickboard;
    gridRef;
    gridStack;
    state;
    setup() {
        this.odoobus = usePlugin(BusPlugin);
        this.orm = usePlugin(ORM);
        this.dialog = usePlugin(DialogPlugin);
        this.action = usePlugin(ActionPlugin);
        let theme = "def";
        if (user.settings.quickboard_theme) {
            theme = user.settings.quickboard_theme;
        }
        let startDate = DateTime.local().startOf("month");
        if (user.settings.quickboard_start_date) {
            startDate = deserializeDateTime(user.settings.quickboard_start_date);
        }
        let endDate = DateTime.now();
        if (user.settings.quickboard_end_date) {
            endDate = deserializeDateTime(user.settings.quickboard_end_date);
        }
        this.gridRef = signal.ref();
        this.state = proxy({
            "boards": [],
            "theme": theme,
            "startDate": startDate,
            "endDate": endDate,
            "boardId": -1,
            "items": [],
        });
        providePlugins([QuickboardPlugin]);
        this.quickboard = proxy(usePlugin(QuickboardPlugin));
        this.quickboard.getQuickboardItemDefs(this.state.boardId);
        useOnChange(() => [this.quickboard.board.isReady], () => {
            const self = this;
            let items = Object.entries(self.quickboard.board.items)
                .filter(([key, value]) => !isNaN(Number.parseInt(key)))
                .map(([key, value]) => Object.assign({}, value));
            this.state.items = items;
        });
        onWillStart(async () => {
            await this.loadBoards();
        });
        onMounted(async () => {
            await this.refreshItems();
        });
        onPatched(() => {
            const ref = this.gridRef();
            this.gridStack =
                this.gridStack ||
                    GridStack.init({
                        float: true,
                        columnOpts: {
                            breakpoints: [{ w: 768, c: 1 }],
                        },
                        cellHeight: "10rem",
                    });
            if (this.gridStack) {
                this.gridStack.batchUpdate();
                this.gridStack.removeAll(false);
                for (let i = 0; i < this.state.items.length; i++) {
                    const element = document.querySelector(`#grid-stack-item-${this.state.items[i]["id"]}`);
                    if (element) {
                        this.gridStack.makeWidget(element);
                    }
                }
                this.gridStack.batchUpdate(false);
            }
        });
        this.odoobus.addChannel("quickboard");
        this.odoobus.subscribe("quickboard_updated", ({}) => {
            this.onQuickboardUpdated();
        });
        this.setupNoData();
    }
    onQuickboardUpdated() {
        this.applyFilter();
        if (this.gridStack)
            this.gridStack.compact();
    }
    onStartDateChanged(date) {
        this.state.startDate = date;
    }
    onEndDateChanged(date) {
        this.state.endDate = date;
    }
    saveQuickboard() {
        if (!this.gridStack)
            return;
        let serializedData = this.gridStack.save(false);
        this.quickboard.saveLayout(serializedData);
    }
    compact() {
        if (this.gridStack)
            this.gridStack.compact();
    }
    async addItem() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "New",
            res_model: "quickboard.item",
            views: [[false, "form"]],
            view_mode: "form",
            target: "new",
            context: {
                dialog_size: "large",
                quick_add: true,
                default_board_id: this.state.boardId
            },
        }, {
            onClose: () => {
                this.applyFilter();
            },
        });
    }
    async loadBoards() {
        let boards = await this.orm.searchRead("quickboard.board", [], ["name"], { order: "sequence, id" });
        if (!boards.length) {
            const [id] = await this.orm.create("quickboard.board", [{ name: _t("My Quickboard") }]);
            boards = [{ id, name: _t("My Quickboard") }];
        }
        this.state.boards = boards;
        const saved = user.settings.quickboard_board_id;
        this.state.boardId = boards.some((b) => b.id === saved) ? saved : boards[0].id;
    }
    refreshItems() {
        return this.quickboard.getQuickboardItemDefs(this.state.boardId);
    }
    get currentBoard() {
        return this.state.boards.find((b) => b.id === this.state.boardId);
    }
    get boardSelectProps() {
        return {
            resModel: "quickboard.board",
            fieldString: _t("Fields"),
            domain: [],
            resId: this.state.boardId,
            update: async (resId) => {
                await this.onSelectBoard(resId);
            },
        };
    }
    async onSelectBoard(id) {
        this.state.boardId = id;
        await user.setUserSettings("quickboard_board_id", id);
        await this.refreshItems();
    }
    addBoard() {
        const known = new Set(this.state.boards.map((b) => b.id));
        this.action.doAction({
            type: "ir.actions.act_window",
            name: _t("New Quickboard"),
            res_model: "quickboard.board",
            views: [[false, "form"]],
            view_mode: "form",
            target: "new",
        }, {
            onClose: async () => {
                await this.loadBoards();
                const created = this.state.boards.find((b) => !known.has(b.id));
                if (created) {
                    await this.onSelectBoard(created.id);
                }
            },
        });
    }
    renameBoard() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: _t("Rename Quickboard"),
            res_model: "quickboard.board",
            res_id: this.state.boardId,
            views: [[false, "form"]],
            view_mode: "form",
            target: "new",
        }, { onClose: () => this.loadBoards() });
    }
    deleteBoard() {
        const board = this.currentBoard;
        if (!board || this.state.boards.length < 2) {
            return;
        }
        this.dialog.add(ConfirmationDialog, {
            title: _t("Delete Quickboard"),
            body: _t("Delete \"%s\" and all of its items? This cannot be undone.", board.name),
            confirmLabel: _t("Delete"),
            confirm: async () => {
                await this.orm.unlink("quickboard.board", [board.id]);
                await this.loadBoards();
                await this.refreshItems();
            },
            cancel: () => { },
        });
    }
    setupNoData() {
        const ChartJs = window.Chart;
        ChartJs.register({
            id: "NoData",
            afterDraw: function (chart) {
                if (chart.data.datasets
                    .map((d) => d.data.length)
                    .reduce((p, a) => p + a, 0) === 0) {
                    const ctx = chart.ctx;
                    const width = chart.width;
                    const height = chart.height;
                    chart.clear();
                    ctx.save();
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("No data to display.", width / 2, height / 2);
                    ctx.restore();
                }
            },
        });
    }
    async applyFilter() {
        await user.setUserSettings("quickboard_start_date", serializeDateTime(this.state.startDate));
        await user.setUserSettings("quickboard_end_date", serializeDateTime(this.state.endDate));
        await this.refreshItems();
    }
    async onSelectTheme(val) {
        this.state.theme = val;
        await user.setUserSettings("quickboard_theme", val);
        await this.refreshItems();
    }
    getThemeSelectionItem(label, theme) {
        return {
            value: theme,
            label: label,
            colors: QUICKBOARD_BG_COLORS[theme]
        };
    }
    get themes() {
        return [
            this.getThemeSelectionItem("Default", "def"),
            this.getThemeSelectionItem("Alternative", "alt"),
            this.getThemeSelectionItem("Cold", "cld"),
            this.getThemeSelectionItem("Hot", "hot"),
            this.getThemeSelectionItem("Earth", "ert"),
            this.getThemeSelectionItem("Colorful", "clr"),
            this.getThemeSelectionItem("Pastel", "ptl"),
            this.getThemeSelectionItem("Pink Purple", "pur"),
        ];
    }
}
registry.category("lazy_components").add("Quickboard", Quickboard);
