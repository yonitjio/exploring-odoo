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
import { cookie } from "@web/core/browser/cookie";
import { signal, proxy, onMounted } from "@odoo/owl";
import { parseDateTime } from "@web/core/l10n/dates";
import { getBackgroundColor } from "@quickboard/core/colors";
import { iconList } from "@quickboard/views/fields/qb_icon_picker/icon_list";
import { QuickboardItemBase } from "@quickboard/quickboard/quickboard_item_base";
const { DateTime } = luxon;
export class QuickboardItemChart extends QuickboardItemBase {
    static template = "quickboard.QuickboardItemChart";
    gsItemRef;
    containerRef;
    chartCanvasRef;
    spinner;
    state;
    chart;
    setup() {
        super.setup();
        this.gsItemRef = signal.ref();
        this.spinner = new Spin.Spinner(this._getSpinnerOpt());
        this.state = proxy({
            "title": "",
            "icon": "",
            "icon_filled": false,
            "chartType": "",
            "data": "",
            "valueFieldName": "",
            "valueFieldType": "",
            "groupFieldName": "",
            "groupFieldType": "",
            "dimensionFieldName": "",
            "dimensionFieldType": "",
            "datetimeGranularity": "",
            "aggregateFunction": "",
            "theme": this.props.theme,
            "startDate": this.props.startDate,
            "endDate": this.props.endDate,
        });
        this.chartCanvasRef = signal.ref();
        onMounted(async () => {
            var target = this.gsItemRef();
            this.spinner.spin(target);
            await this.loadData(this.props.itemId, this.state.startDate, this.state.endDate).then(() => {
                this.spinner.stop();
            });
        });
    }
    get color_scheme() {
        return cookie.get("color_scheme");
    }
    get gridColor() {
        return this.color_scheme === "dark" ? "rgba(208, 208, 208, 0.3)" : "rgba(86, 86, 86, 0.3)";
    }
    get labelColor() {
        return this.color_scheme === "dark" ? "#fff" : "#000";
    }
    async onMessage(id) {
        if (id == this.itemId) {
            var target = this.gsItemRef();
            this.spinner.spin(target);
            const ref = this.chartCanvasRef();
            if (ref) {
                ref.style.display = "none";
            }
            await this.loadData(this.props.itemId, this.state.startDate, this.state.endDate).then(() => {
                this.spinner.stop();
            });
        }
    }
    async loadData(itemId, startDate, endDate) {
        var target = this.gsItemRef();
        this.spinner.spin(target);
        const res = await this.quickboard.getQuickboardItem(itemId, startDate, endDate);
        const icon = iconList.find(o => o.value === res.icon);
        this.state.title = res.name;
        this.state.icon = icon?.icon;
        this.state.icon_filled = icon?.icon_filled;
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
        this.renderChart(this.state.chartType, this.state.data, this.state.valueFieldName, this.state.aggregateFunction, this.state.dimensionFieldType, this.state.datetimeGranularity);
    }
    _getCircularChartConfig(chartType, data, valueFieldName, aggregateFunction, dimensionFieldType, datetimeGranularity) {
        if (chartType === "polar") {
            chartType = "polarArea";
        }
        const chartData = [];
        let labels = [];
        let dataset_color = [];
        data.forEach((element, index) => {
            const lbl = Object.entries(element["dataset"])
                .filter(([key, value]) => !isNaN(Number.parseInt(key)))
                .map(([key, value]) => value[0]);
            labels = Array.from(new Set(labels.concat(lbl)));
        });
        dataset_color = labels.map((_, index) => getBackgroundColor(index, this.state.theme));
        data.forEach((element, index) => {
            const dt = Object.entries(element["dataset"])
                .filter(([key, value]) => !isNaN(Number.parseInt(key)))
                .map(([key, value]) => value[1]);
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
                        position: "bottom",
                        labels: {
                            color: this.labelColor
                        }
                    }
                }
            },
        };
        return chartConfig;
    }
    _getXYChartConfig(chartType, data, valueFieldName, aggregateFunction, dimensionFieldType, datetimeGranularity) {
        const chartData = [];
        data.forEach((element, index) => {
            const dt = Object.entries(element["dataset"])
                .filter(([key, value]) => !isNaN(Number.parseInt(key)))
                .map(([key, value]) => {
                const val = value;
                let x_val;
                let y_val;
                let dateTimeDimension = ["date", "datetime"].includes(dimensionFieldType);
                if (chartType === 'horizontal-bar') {
                    x_val = val[1];
                    y_val = dateTimeDimension ? parseDateTime(val[0]) : val[0];
                }
                else {
                    x_val = dateTimeDimension ? parseDateTime(val[0]) : val[0];
                    y_val = val[1];
                }
                return Object.assign({}, {
                    x: x_val,
                    y: y_val
                });
            });
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
        let y_axis_option = {};
        if (["date", "datetime"].includes(dimensionFieldType)) {
            if (chartType === 'horizontal-bar') {
                chartType = 'bar';
                y_axis_option = {
                    indexAxis: 'y',
                    scales: {
                        x: {
                            grid: {
                                color: this.gridColor
                            },
                            ticks: {
                                color: this.labelColor
                            }
                        },
                        y: {
                            type: "time",
                            time: {
                                unit: datetimeGranularity,
                            },
                            grid: {
                                color: this.gridColor
                            },
                            ticks: {
                                color: this.labelColor
                            }
                        },
                    },
                };
            }
            else {
                x_axis_option = {
                    scales: {
                        x: {
                            type: "time",
                            time: {
                                unit: datetimeGranularity,
                            },
                            grid: {
                                color: this.gridColor
                            },
                            ticks: {
                                color: this.labelColor
                            },
                        },
                        y: {
                            grid: {
                                color: this.gridColor
                            },
                            ticks: {
                                color: this.labelColor
                            }
                        }
                    },
                };
            }
        }
        else {
            if (chartType === 'horizontal-bar') {
                chartType = 'bar';
                y_axis_option = {
                    indexAxis: 'y',
                    scales: {
                        x: {
                            grid: {
                                color: this.gridColor
                            },
                            ticks: {
                                color: this.labelColor
                            },
                        },
                        y: {
                            grid: {
                                color: this.gridColor
                            },
                            ticks: {
                                color: this.labelColor
                            },
                        }
                    }
                };
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
                        position: "bottom",
                        labels: {
                            color: this.labelColor
                        }
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
            .filter(([key, value]) => !isNaN(Number.parseInt(key)))
            .map(([key, value]) => Object.assign({}, value));
        let chartConfig = {};
        if (["doughnut", "pie", "polar"].includes(chartType)) {
            chartConfig = this._getCircularChartConfig(chartType, data, valueFieldName, aggregateFunction, dimensionFieldType, datetimeGranularity);
        }
        else {
            chartConfig = this._getXYChartConfig(chartType, data, valueFieldName, aggregateFunction, dimensionFieldType, datetimeGranularity);
        }
        const ref = this.chartCanvasRef();
        if (ref) {
            const ctx = ref.getContext("2d");
            if (this.chart) {
                this.chart.destroy();
            }
            const ChartJs = window.Chart;
            this.chart = new ChartJs(ctx, chartConfig);
        }
    }
}
