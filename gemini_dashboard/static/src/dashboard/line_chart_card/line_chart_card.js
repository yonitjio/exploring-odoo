/** @odoo-module */

import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { Record } from "@web/model/record";
import { LineChart } from "../line_chart/line_chart";
import { GeminiDashboardHtmlField } from "../../components/html_field/html_field";

export class LineChartCard extends Component {
  static template = "gemini_dashboard.LineChartCard";
  static components = { LineChart, Record, GeminiDashboardHtmlField };
  static props = {
    title: { type: String },
    data: { type: Object },
    chartData: { type: String, optional: true },
    loadingData: { type: Boolean, optional: true },
  };

  setup() {
    this.props.chartData = "";
    this.props.loadingData = false;

    this.state = useState({
      loadingData: this.props.loadingData,
      chartData: this.props.chartData
    });

    this.fieldNames = ["text"];
    this.fields = {
      text: { name: "text", type: "char" },
    };

    this.notification = useService("notification");
    this.orm = useService("orm");
  }

  getHtmlFieldProps(record) {
    return {
      record,
      readonly: false,
      name: "text",
      chartData: this.state.chartData,
      loadingData: this.state.loadingData,
      wysiwygOptions: {},
    };
  }

  onChartProgress(animation) {
    this.state.loadingData = true;
  }

  onChartComplete(animation) {
    this.state.loadingData = false;
    this.state.chartData = animation.chart.toBase64Image();
  }
}
