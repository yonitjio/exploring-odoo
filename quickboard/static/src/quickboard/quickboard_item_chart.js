/** @odoo-module **/
import { Component, useState, useRef, onMounted } from "@odoo/owl";
import { getColor } from "./colors";

import { QuickboardItemBase } from "./quickboard_item_base";

export class QuickboardItemChart extends QuickboardItemBase {
    static template = "quickboard.QuickboardItemChart";

    setup() {
        super.setup();

        this.gsItemRef = useRef("grid-stack-item");
        this.spinner = new Spin.Spinner(this._getSpinnerOpt());

        this.state = useState({
            "title": "",
            "icon": "",
            "chartType": "",
            "data": "",
            "valueFieldName": "",
            "valueFieldType": "",
            "dimensionFieldName": "",
            "dimensionFieldType": "",
            "datetimeGranularity": "",
            "aggregateFunction": "",
            "datetimeGranularity": "",

            "startDate": this.props.startDate,
            "endDate": this.props.endDate,
        });
        this.chartCanvasRef = useRef("chartCanvas");

        onMounted(async () => {
            var target = this.gsItemRef.el;
            this.spinner.spin(target);
            await this.loadData(
                this.props.itemId,
                this.state.startDate,
                this.state.endDate
            ).then(() => {
                this.spinner.stop();
            });
        });
    }

    async onMessage(id) {
        if (id == this.itemId) {
            var target = this.gsItemRef.el;
            this.spinner.spin(target);
            if (this.chartCanvasRef.el) {
                this.chartCanvasRef.el.style.display = "none";
            }
            await this.loadData(
                this.props.itemId,
                this.state.startDate,
                this.state.endDate
            ).then(() => {
                this.spinner.stop();
            });
        }
    }

    async loadData(itemId, startDate, endDate) {
        var target = this.gsItemRef.el;
        this.spinner.spin(target);

        const res = await this.quickboard.getQuickboardItem(
            itemId,
            startDate,
            endDate
        );
        this.state.title = res.name;
        this.state.icon = res.icon;
        this.state.chartType = res.chart_type;
        this.state.data = res.data;
        this.state.valueFieldName = res.value_field_name;
        this.state.valueFieldType = res.value_field_type;
        this.state.dimensionFieldName = res.dimension_field_name;
        this.state.dimensionFieldType = res.dimension_field_type;
        this.state.aggregateFunction = res.aggregate_function;
        this.state.datetimeGranularity = res.datetime_granularity;

        this.renderChart(
            this.state.chartType,
            this.state.data,
            this.state.valueFieldName,
            this.state.aggregateFunction,
            this.state.dimensionFieldType,
            this.state.datetimeGranularity
        );
    }

    renderChart(
        chartType,
        chartData,
        valueFieldName,
        aggregateFunction,
        dimensionFieldType,
        datetimeGranularity
    ) {
        let data = Object.entries(chartData)
            .filter(([k, v]) => !isNaN(k))
            .map(([k, v]) => Object.assign({}, v));
        const dataset_color = data.map((_, index) => getColor(index));

        let labels = [];
        if (["doughnut", "pie", "polar"].includes(chartType)) {
            labels = data.map((o) => {
                return o["x"];
            });
            data = data.map((o) => {
                return o["y"];
            });

            if (chartType === "polar") {
                chartType = "polarArea";
            }
        }

        let x_axis_option = {};
        if (["date", "datetime"].includes(dimensionFieldType)) {
            data = data.map((o) => {
                return {
                    x: luxon.DateTime.fromSQL(o["x"]),
                    y: o["y"],
                };
            });

            x_axis_option = {
                scales: {
                    x: {
                        type: "time",
                        time: {
                            unit: datetimeGranularity,
                        },
                    },
                },
            };
        }

        let chartConfig = {
            type: chartType,
            data: {
                labels: labels,
                datasets: [
                    {
                        label: aggregateFunction + ":" + valueFieldName,
                        data: data,
                        backgroundColor: dataset_color,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            },
        };

        Object.assign(chartConfig.options, x_axis_option);

        if (this.chartCanvasRef.el) {
            const ctx = this.chartCanvasRef.el.getContext("2d");
            if (this.chart) {
                this.chart.destroy();
            }
            this.chart = new Chart(ctx, chartConfig);
        }
    }
}
