/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { Wysiwyg } from '@web_editor/js/wysiwyg/wysiwyg';
import { preserveCursor, closestElement } from '@web_editor/js/editor/odoo-editor/src/OdooEditor';
import { patch } from "@web/core/utils/patch";
import { GenerateTextDialog } from "@gemini_editor/js/wysiwyg/widget/generate_text";

patch(Wysiwyg.prototype, {
    _getPowerboxOptions() {
        const options = super._getPowerboxOptions(...arguments);
        const {commands, categories} = options;
        categories.push(
            {
                name: _t('Google Gemini'),
                priority: 1,
            }
        );
        commands.push(
            {
                category: _t('Google Gemini'),
                name: _t('Generate text'),
                priority: 1,
                description: _t('Generate text'),
                fontawesome: 'fa-pencil',
                callback: async () => this.openGenerateDialog(),
            },
        );
        return {...options, commands, categories};
    },
    async openGenerateDialog() {
        const resId = this.props.options.recordInfo.res_id;
        const resModel = this.props.options.recordInfo.res_model;

        let startPrompts = "";
        const fields = await this.env.services.orm.call(resModel, "fields_get");
        if ("name" in fields){
            const res = await this.env.services.orm.searchRead(resModel,
                [["id", "=", resId]], ["id", "name"]);
            if (res[0]) {
                startPrompts = res[0].name;
            }
        }
        const restore = preserveCursor(this.odooEditor.document);
        const params = {
            startPrompt: startPrompts,
            insert: content => {
                this.focus();
                restore();
                this.odooEditor.execCommand('insert', content);
            }};
        this.env.services.dialog.add(GenerateTextDialog, params);
    }
});
