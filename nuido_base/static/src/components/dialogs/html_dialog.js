// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, markup, status, useRef, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { HtmlUpgradeManager } from "@html_editor/html_migrations/html_upgrade_manager";
import { COLLABORATION_PLUGINS, DYNAMIC_PLACEHOLDER_PLUGINS, EMBEDDED_COMPONENT_PLUGINS, MAIN_PLUGINS, } from "@html_editor/plugin_sets";
import { MAIN_EMBEDDINGS, } from "@html_editor/others/embedded_components/embedding_sets";
import { normalizeHTML } from "@html_editor/utils/html";
import { Wysiwyg } from "@html_editor/wysiwyg";
import { Mutex } from "@web/core/utils/concurrency";
import { useService } from "@web/core/utils/hooks";
import { withSequence } from "@html_editor/utils/resource";
import { fixInvalidHTML, instanceofMarkup } from "@html_editor/utils/sanitize";
function computeContainsComplexHTML(value) {
    const domParser = new DOMParser();
    if (!value) {
        return false;
    }
    const parsedOriginal = domParser.parseFromString(value, "text/html");
    return !!parsedOriginal.head.innerHTML.trim();
}
export class HtmlDialog extends Component {
    setup() {
        this.htmlUpgradeManager = new HtmlUpgradeManager();
        this.mutex = new Mutex();
        this.codeViewRef = useRef("codeView");
        this.orm = useService("orm");
        this.isDirty = false;
        this.state = useState({
            value: this.props.initialValue,
            key: 0,
            showCodeView: false,
            containsComplexHTML: computeContainsComplexHTML(this.props.initialValue),
        });
    }
    onEditorLoad(editor) {
        this.editor = editor;
    }
    onChange() {
        this.isDirty = true;
    }
    updateValue(value) {
        this.isDirty = false;
        this.state.value = normalizeHTML(value);
    }
    async getEditorContent() {
        var _a;
        await ((_a = this.editor.shared.media) === null || _a === void 0 ? void 0 : _a.savePendingImages());
        return this.editor.getElContent();
    }
    async _commitChanges({ urgent }) {
        if (status(this) === "destroyed") {
            return;
        }
        if (this.isDirty) {
            if (this.state.showCodeView) {
                this.updateValue(this.codeViewRef.el.value);
                return;
            }
            if (urgent) {
                this.updateValue(this.editor.getContent());
            }
            const el = await this.getEditorContent();
            const content = el.innerHTML;
            this.updateValue(content);
        }
    }
    async commitChanges(urgent = false) {
        if (urgent) {
            await this._commitChanges({ urgent });
        }
        else {
            return this.mutex.exec(() => this._commitChanges({ urgent }));
        }
    }
    async onBlur() {
        return await this.commitChanges();
    }
    async toggleCodeView() {
        await this.commitChanges();
        this.state.showCodeView = !this.state.showCodeView;
        if (!this.state.showCodeView && this.editor) {
            this.editor.editable.innerHTML = this.value;
            this.editor.shared.history.addStep();
        }
    }
    getConfig() {
        const config = {
            content: this.value,
            Plugins: [
                ...MAIN_PLUGINS,
                ...(this.props.isCollaborative ? COLLABORATION_PLUGINS : []),
                ...(this.props.dynamicPlaceholder ? DYNAMIC_PLACEHOLDER_PLUGINS : []),
                ...(this.props.embeddedComponents ? EMBEDDED_COMPONENT_PLUGINS : []),
            ],
            onChange: this.onChange.bind(this),
            dropImageAsAttachment: true, // @todo @phoenix always true ?
            resources: {},
            ...this.props.editorConfig,
        };
        if (!("baseContainer" in config)) {
            config.baseContainer = "DIV";
        }
        if (this.props.embeddedComponents) {
            // TODO @engagement: fill this array with default/base components
            config.resources.embedded_components = [...MAIN_EMBEDDINGS];
        }
        config.resources = {
            user_commands: [
                {
                    id: "codeview",
                    title: "Code view",
                    icon: "fa-code",
                    run: this.toggleCodeView.bind(this),
                },
            ],
            toolbar_groups: withSequence(100, {
                id: "codeview",
            }),
            toolbar_items: {
                id: "codeview",
                groupId: "codeview",
                commandId: "codeview",
            },
        };
        return config;
    }
    get value() {
        const value = this.state.value;
        const newVal = this.htmlUpgradeManager.processForUpgrade(fixInvalidHTML(value), {
            containsComplexHTML: this.state.containsComplexHTML,
            env: this.env,
        });
        if (instanceofMarkup(value)) {
            return markup(newVal);
        }
        return newVal;
    }
    get wysiwygKey() {
        return `${this.props.id}_${this.state.key}`;
    }
    generateId() {
        // No need for secure random number.
        return Math.floor(Math.random() * Math.pow(2, 52)).toString();
    }
    onClickApply() {
        this.props.apply(this.state.value);
        this.props.close();
    }
}
HtmlDialog.template = "nuido_base.html-dialog";
HtmlDialog.components = {
    Dialog,
    Wysiwyg
};
HtmlDialog.props = {
    id: String,
    title: String,
    initialValue: String,
    editorConfig: { type: Object, optional: true },
    embeddedComponents: { type: Boolean, optional: true },
    apply: Function,
    close: Function,
};
