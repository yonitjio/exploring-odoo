/** @odoo-module */

import { loadJS } from "@web/core/assets";
import {
  Component,
  onMounted,
  onWillStart,
  useRef,
  onPatched,
  onWillUnmount,
} from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class LineChart extends Component {
  static template = "gemini_dashboard.LineChart";
  static props = {
    label: String,
    data: Object,
    onComplete: { type: Function },
    onProgress: { type: Function },
  };

  setup() {
    this.canvasRef = useRef("canvas");
    onWillStart(async () => {
      await loadJS(["/web/static/lib/Chart/Chart.js"]);
      await loadJS([
        "/gemini_dashboard/static/lib/Chart/chartjs-plugin-datalabels.js",
      ]);
      if (this.chart) {
        this.chart.destroy();
      }
    });

    onMounted(() => {
      this.renderChart();
    });

    onPatched(() => {
      this.renderChart();
    });

    onWillUnmount(() => {
      if (this.chart) {
        this.chart.destroy();
      }
    });
  }

  renderChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    if (this.props.data) {
      const axis = Object.keys(this.props.data);
      const data = Object.values(this.props.data);
      const ctx = this.canvasRef.el.getContext("2d");
      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: data[0],
          datasets: [
            {
              label: this.props.label,
              data: data[1],
              datalabels: {
                align: "end",
                anchor: "end",
              },
            },
          ],
        },
        options: {
          scales: {
            x: { title: { display: true, text: axis[0] } },
            y: { title: { display: true, text: axis[1] } },
          },
          layout: {
            padding: {
              top: 32,
              right: 16,
              bottom: 16,
              left: 8,
            },
          },
          elements: {
            line: {
              fill: false,
              tension: 0.4,
            },
          },
          maintainAspectRatio: false,
          animation: {
            onProgress: this.props.onProgress,
            onComplete: this.props.onComplete,
          },
          plugins: {
            datalabels: {
              backgroundColor: function (context) {
                return context.dataset.backgroundColor;
              },
              borderRadius: 4,
              color: "white",
              font: {
                weight: "bold",
              },
              formatter: function(value, context) {
                return Math.round(value).toLocaleString();
              },
              padding: 6,
            },
          },
        },
        plugins: [ChartDataLabels],
      });
    }
  }
}
