/** @odoo-module **/
import { parseDate, parseDateTime } from "@web/core/l10n/dates";
import { useState, useRef, onMounted } from "@odoo/owl";
import { getBackgroundColor } from "../core/colors";

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

            "theme": this.props.theme,
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
        this.state.groupFieldName = res.group_field_name;
        this.state.groupFieldType = res.group_field_type;
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

    _getCircularChartConfig(chartType, data, valueFieldName, aggregateFunction, dimensionFieldType, datetimeGranularity){
        if (chartType === "polar") {
            chartType = "polarArea";
        }

        const chartData = [];
        let labels = [];
        let dataset_color = [];
        data.forEach((element, index) => {
            const lbl = Object.entries(element["dataset"])
                .filter(([k, v]) => !isNaN(k))
                .map(([k, v]) => v[0]);

            labels =  Array.from(new Set(labels.concat(lbl)))
        });

        dataset_color = labels.map((_, index) => getBackgroundColor(index, this.state.theme));

        data.forEach((element, index) => {
            const dt = Object.entries(element["dataset"])
                .filter(([k, v]) => !isNaN(k))
                .map(([k, v]) => v[1]);

            chartData.push({
                label: element.label,
                data: dt,
                backgroundColor: dataset_color
            });
        });

        let chartConfig = {
            type: chartType,
            data: {
                labels: labels,
                datasets: chartData,
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

        return chartConfig;
    }

    _getXYChartConfig(chartType, data, valueFieldName, aggregateFunction, dimensionFieldType, datetimeGranularity){
        const chartData = [];
        data.forEach((element, index) => {
            const dt = Object.entries(element["dataset"])
                .filter(([k, v]) => !isNaN(k))
                .map(([k, v]) => {
                    let x_val;
                    let y_val;
                    let dateTimeDimension = ["date", "datetime"].includes(dimensionFieldType)
                    if (chartType === 'horizontal-bar'){
                        x_val = v[1];
                        y_val = dateTimeDimension ? parseDateTime(v[0]) : v[0]
                    } else {
                        x_val = dateTimeDimension ? parseDateTime(v[0]) : v[0];
                        y_val = v[1]
                    }

                    return Object.assign({}, {
                        x: x_val,
                        y: y_val
                    })
                }
            );

            const dataset_color = getBackgroundColor(index, this.state.theme);

            chartData.push({
                label: element.label,
                data: dt,
                backgroundColor: dataset_color,
                borderColor: dataset_color,
                borderWidth: 3,
                cubicInterpolationMode: 'monotone',
            });
        });

        let x_axis_option = {};
        let y_axis_option = {}
        if (["date", "datetime"].includes(dimensionFieldType)) {
            if (chartType === 'horizontal-bar') {
                chartType = 'bar';
                y_axis_option = {
                    indexAxis: 'y',
                    scales: {
                        y: {
                            type: "time",
                            time: {
                                unit: datetimeGranularity,
                            },
                        },
                    },
                }
            } else {
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
        } else {
            if (chartType === 'horizontal-bar') {
                chartType = 'bar';
                y_axis_option = {
                    indexAxis: 'y',
                }
            }
        }

        let chartConfig = {
            type: chartType,
            data: {
                datasets: chartData
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
        Object.assign(chartConfig.options, y_axis_option);

        return chartConfig;
    }

    renderChart(chartType, chartData, valueFieldName, aggregateFunction, dimensionFieldType, datetimeGranularity) {
        let data = Object.entries(chartData)
            .filter(([k, v]) => !isNaN(k))
            .map(([k, v]) => Object.assign({}, v));

        let chartConfig = {}
        if (["doughnut", "pie", "polar"].includes(chartType)) {
            chartConfig = this._getCircularChartConfig(chartType, data, valueFieldName, aggregateFunction, dimensionFieldType, datetimeGranularity)
        } else {
            chartConfig = this._getXYChartConfig(chartType, data, valueFieldName, aggregateFunction, dimensionFieldType, datetimeGranularity)
        }

        if (this.chartCanvasRef.el) {
            const ctx = this.chartCanvasRef.el.getContext("2d");
            if (this.chart) {
                this.chart.destroy();
            }
            this.chart = new Chart(ctx, chartConfig);
        }
    }
}
