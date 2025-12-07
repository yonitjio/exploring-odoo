/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { Component, markup, status, useRef, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { HtmlUpgradeManager } from "@html_editor/html_migrations/html_upgrade_manager";
import { MAIN_PLUGINS, NO_EMBEDDED_COMPONENTS_FALLBACK_PLUGINS } from "@html_editor/plugin_sets";
import { normalizeHTML } from "@html_editor/utils/html";
import { Wysiwyg } from "@html_editor/wysiwyg";
import { Mutex } from "@web/core/utils/concurrency";
import { withSequence } from "@html_editor/utils/resource";
import { fixInvalidHTML, instanceofMarkup } from "@html_editor/utils/sanitize";
import { isHtmlContentSupported } from "@html_editor/core/selection_plugin";
function computeContainsComplexHTML(value) {
    const domParser = new DOMParser();
    if (!value) {
        return false;
    }
    const parsedOriginal = domParser.parseFromString(value, "text/html");
    return !!parsedOriginal.head.innerHTML.trim();
}
export class HtmlDialog extends Component {
    static template = "nuido_base.html-dialog";
    static components = {
        Dialog,
        Wysiwyg
    };
    static props = {
        id: String,
        title: String,
        initialValue: String,
        editorConfig: { type: Object, optional: true },
        embeddedComponents: { type: Boolean, optional: true },
        apply: Function,
        close: Function,
    };
    state;
    htmlUpgradeManager;
    mutex;
    codeViewRef;
    editor;
    isDirty;
    setup() {
        this.htmlUpgradeManager = new HtmlUpgradeManager();
        this.mutex = new Mutex();
        this.codeViewRef = useRef("codeView");
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
        this.state.value = markup(normalizeHTML(value));
    }
    async getEditorContent() {
        await this.editor.shared.imageSave?.savePendingImages();
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
            this._commitChanges({ urgent });
        }
        else {
            return this.mutex.exec(() => this._commitChanges({ urgent }));
        }
    }
    onBlur() {
        return this.commitChanges();
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
                ...NO_EMBEDDED_COMPONENTS_FALLBACK_PLUGINS
            ],
            onChange: this.onChange.bind(this),
            dropImageAsAttachment: true,
            ...this.props.editorConfig,
        };
        if (!("baseContainers" in config)) {
            config.baseContainers = ["DIV", "P"];
        }
        config.resources = {
            user_commands: [
                {
                    id: "codeview",
                    description: "Code view",
                    icon: "fa-code",
                    run: this.toggleCodeView.bind(this),
                    isAvailable: isHtmlContentSupported,
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
        let newVal = fixInvalidHTML(value);
        newVal = this.htmlUpgradeManager.processForUpgrade(newVal, {
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
        return Math.floor(Math.random() * Math.pow(2, 52)).toString();
    }
    onClickApply() {
        this.props.apply(this.state.value);
        this.props.close();
    }
}
