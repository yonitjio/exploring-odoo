/** @odoo-module */

import { useState, useRef } from "@odoo/owl";
import { HtmlField, htmlField } from "@web_editor/js/backend/html_field";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";

export class GeminiDashboardHtmlField extends HtmlField {
    static template = "gemini_dashboard.GeminiDashboardHtmlField";
    static props = {
        ...super.props,
        chartData: { type: String, optional: true },
        loadingData: { type: Boolean, optional: true},
    };

    setup() {
        super.setup();
        this.notification = useService("notification");
        this.state = useState({
            generating: false,
        });

        this.audioPlayer = useRef("audioPlayer");
    }

    _buildPrompt() {
        let result = "Describe the chart and also summarize it with statistical summaries such as max, min, average, median, etc.";

        return result;
    }

    _processGeneratedText(content) {
        const lines = content.split("\n").filter((line) => line.trim().length);
        const fragment = document.createDocumentFragment();
        let converter = new showdown.Converter();
        let result = converter.makeHtml(content);
        let el = document.createElement("p");
        el.innerHTML = result;
        fragment.appendChild(el);
        return fragment;
    }

    _generate(prompt, image, callback) {
        const protectedCallback = (...args) => {
            delete this.pendingRpcPromise;
            return callback(...args);
        };
        this.pendingRpcPromise = this.rpc(
            "/gemini_dashboard/describe",
            {
                prompt: prompt,
                image: image,
            },
            { shadow: true }
        );
        return this.pendingRpcPromise
            .then((content) => protectedCallback(content))
            .catch((error) =>
                protectedCallback(
                    _t(error.data?.message || error.message),
                    true
                )
            );
    }

    onBeginDescribing() {
        if (this.props.loadingData){
            this.notification.add("Loading data, please try again later.", { type: "error" });
            return;
        }

        if (!this.props.chartData) {
            this.notification.add("No chart data.", { type: "error" });
            return;
        }

        const aiPrompt = this._buildPrompt();
        this.state.generating = true;
        this._generate(aiPrompt, this.props.chartData, (content_json, isError) => {
            this.state.generating = false;
            if (!isError) {
                let content = JSON.parse(content_json);
                let result = this._processGeneratedText(content.text);
                if (result) {
                    this.wysiwyg.focus();
                    this.wysiwyg.resetValue('');
                    this.wysiwyg.odooEditor.execCommand("insert", result);
                    this.audioPlayer.el.src = content.audio;
                    this.audioPlayer.el.play();
                }
            } else {
                console.error(content_json);
                this.notification.add(content_json, { type: "error" });
            }
        });
    }
}

export const geminiDashboardHtmlField = Object.assign(
    Object.create(htmlField),
    {
        component: GeminiDashboardHtmlField,
    }
);

registry
    .category("fields")
    .add("gemini_dashboard_html_field", geminiDashboardHtmlField);
