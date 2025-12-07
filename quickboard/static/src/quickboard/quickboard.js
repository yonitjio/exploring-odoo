/** @odoo-module **/

import { Component, useRef, useEffect, useState, onPatched } from "@odoo/owl";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";
import { registry } from "@web/core/registry";
import { user } from "@web/core/user";
import { useService } from "@web/core/utils/hooks";
import { DateTimeInput } from "@web/core/datetime/datetime_input";
import { SelectMenu } from "@web/core/select_menu/select_menu";
import { deserializeDateTime, serializeDateTime } from "@web/core/l10n/dates";
import { QuickboardItem } from "./quickboard_item";
import { QUICKBOARD_BG_COLORS } from "../core/colors"

class Quickboard extends Component {
    static template = "quickboard";
    static components = { SelectMenu, DateTimeInput, QuickboardItem };
    static props = {
        ...standardActionServiceProps,
    };

    setup() {
        this.action = useService("action");
        this.dialog = useService("dialog");

        let theme = "def";
        if (user.settings.quickboard_theme) {
            theme = user.settings.quickboard_theme;
        }

        let startDate = luxon.DateTime.local().startOf("month");
        if (user.settings.quickboard_start_date) {
            startDate = deserializeDateTime(
                user.settings.quickboard_start_date
            );
        }
        let endDate = luxon.DateTime.now();
        if (user.settings.quickboard_end_date) {
            endDate = deserializeDateTime(user.settings.quickboard_end_date);
        }

        this.gridRef = useRef("grid-stack");
        this.state = useState({
            "theme": theme,
            "startDate": startDate,
            "endDate": endDate,
            "items": [],
        });

        this.quickboard = useState(useService("quickboard"));
        this.quickboard.getQuickboardItemDefs(
            this.state.startDate,
            this.state.endDate
        );

        useEffect(
            (isReady) => {
                self = this;
                let items = Object.entries(this.quickboard.items)
                    .filter(([k, v]) => !isNaN(k))
                    .map(([k, v]) => Object.assign({}, v));
                this.state.items = items;
            },
            () => [this.quickboard.isReady]
        );

        onPatched(() => {
            this.gridRef.current =
                this.gridRef.current ||
                GridStack.init({
                    float: true,
                    columnOpts: {
                        breakpoints: [{ w: 768, c: 1 }],
                    },
                    cellHeight: "10rem",
                });
            if (this.gridRef.current) {
                const grid = this.gridRef.current;
                grid.batchUpdate();
                grid.removeAll(false);

                for (let i = 0; i < this.state.items.length; i++) {
                    const element = document.querySelector(
                        `#grid-stack-item-${this.state.items[i]["id"]}`
                    );
                    if (element) {
                        grid.makeWidget(element);
                    }
                }

                grid.batchUpdate(false);
            }
        });

        this.busService = this.env.services.bus_service;
        this.busService.addChannel("quickboard");
        this.busService.subscribe("quickboard_updated", ({}) => {
            this.onQuickboardUpdated();
        });

        this.setupNoData();
    }

    onQuickboardUpdated() {
        this.applyFilter();
        let grid = this.gridRef.current;
        grid.compact();
    }

    onStartDateChanged(date) {
        this.state.startDate = date;
    }

    onEndDateChanged(date) {
        this.state.endDate = date;
    }

    saveQuickboard(ev) {
        let serializedData = this.gridRef.current.save(false);
        this.quickboard.saveLayout(serializedData);
    }

    compact(ev) {
        let grid = this.gridRef.current;
        grid.compact();
    }

    async generateQuickboard(ev) {
        const cell_width = this.gridRef.current.cellWidth();
        // DO NOT REMOVE: Without this the getCellHeight will return weird number
        const h_0 = this.gridRef.current.cellHeight().el.clientHeight;
        const cell_height = this.gridRef.current.getCellHeight();
        const screen_width = screen.width;
        const screen_height = screen.height;

        this.action.doAction(
            {
                type: "ir.actions.act_window",
                name: "Generate Quickboard",
                res_model: "quickboard.generator",
                views: [[false, "form"]],
                view_mode: "form",
                target: "new",
                context: {
                    dialog_size: "medium",
                    cell_width: cell_width,
                    cell_height: cell_height,
                    screen_width: screen_width,
                    screen_height: screen_height,
                },
            }
        );
    }

    async addItem(ev) {
        this.action.doAction(
            {
                type: "ir.actions.act_window",
                name: "New",
                res_model: "quickboard.item",
                views: [[false, "form"]],
                view_mode: "form",
                target: "new",
                context: {
                    dialog_size: "medium",
                    quick_add: true
                },
            },
            {
                onClose: () => {
                    this.applyFilter();
                },
            }
        );
    }

    setupNoData() {
        Chart.register({
            id: "NoData",
            afterDraw: function (chart) {
                if (
                    chart.data.datasets
                        .map((d) => d.data.length)
                        .reduce((p, a) => p + a, 0) === 0
                ) {
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

    async applyFilter(ev) {
        await user.setUserSettings(
            "quickboard_start_date",
            serializeDateTime(this.state.startDate)
        );
        await user.setUserSettings(
            "quickboard_end_date",
            serializeDateTime(this.state.endDate)
        );
        await this.quickboard.getQuickboardItemDefs();
    }

    async onSelectTheme(val) {
        this.state.theme = val;
        await user.setUserSettings("quickboard_theme", val);
        this.quickboard.getQuickboardItemDefs();
    }

    getThemeSelectionItem(label, theme){
        return {
            value: theme,
            label: label,
            colors: QUICKBOARD_BG_COLORS[theme]
        }
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
