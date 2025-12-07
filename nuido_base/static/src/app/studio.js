// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { Component, EventBus, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useBus, useService } from "@web/core/utils/hooks";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";
import { DocumentModel } from "@nuido/models/document";
import { RecalculateEdgeEndpointsEventType } from "@nuido/components/events";
import { NuidoUi } from "@nuido/app/nuido_ui";
import { uuidv4 } from "@nuido/utils/utils";
import { SidebarMenu } from "@nuido_base/app/sidebar_menu";
import { ViewJsonDialog } from "@nuido_base/components/dialogs/view_json_dialog";
import { TextInputDialog } from "@nuido_base/components/dialogs/text_input_dialog";
import { Default, DefaultAux } from "@nuido/utils/registry";
export class NuidoStudio extends Component {
    setup() {
        this.notification = useService("notification");
        this.dialog = useService("dialog");
        this.orm = useService("orm");
        this.action = useService("action");
        this.channel = "nuido_base";
        this.state = useState({
            nbus: new EventBus(),
            documents: [],
            edgeType: this.edgeType,
            auxEdgeType: this.auxEdgeType,
            zoom: 1,
        });
        useBus(this.state.nbus, this.channel + "/translation_changed" /* NuidoEventType.translation_changed */, this.translation_changed.bind(this));
        onWillStart(this.onWillStart);
    }
    async onWillStart() {
        const activeId = this.props.action.context.active_id;
        if (activeId) {
            const rec = await this.orm.searchRead(this.resModel, [['id', '=', activeId]]);
            if (rec.length > 0) {
                await this.newDoc();
                this.currentDoc.title = rec[0]["title"];
                this.currentDoc.fromJson(rec[0]["raw"]);
                this.currentDoc.isProcessed = rec[0]["is_processed"];
            }
            else {
                this.notification.add('Document not found, creating new one instead.', {
                    title: 'Error',
                    type: 'danger',
                    sticky: true,
                });
                await this.newDoc();
            }
        }
        else {
            await this.newDoc();
        }
    }
    async newDoc() {
        const docId = uuidv4();
        const sessionId = uuidv4();
        const newDoc = new DocumentModel(docId, sessionId, docId);
        newDoc.edgeType = this.state.edgeType;
        newDoc.auxEdgeType = this.state.auxEdgeType;
        newDoc.title = "New";
        this.state.documents.push(newDoc);
        await new Promise(resolve => {
            setTimeout(() => {
                if (this.state.documents.length > 1) {
                    this.state.documents.shift();
                }
                resolve(undefined);
            }, 250);
        }); // give time before destroying component
    }
    get currentDoc() {
        return this.state.documents[this.state.documents.length - 1];
    }
    notifyNewNode(icon, title, type, x, y) {
        this.state.nbus.trigger(this.channel + "/new" /* DocumentEventType.new */, { icon: icon, title: title, type: type, x: x, y: y });
    }
    onShowJson() {
        const jsonDoc = this.state.documents[0].toJson();
        this.dialog.add(ViewJsonDialog, {
            json: jsonDoc
        });
    }
    onFixEdgeEndpoints() {
        this.state.nbus.trigger(this.channel + RecalculateEdgeEndpointsEventType);
    }
    get resModel() {
        return this.constructor.res_model;
    }
    get appName() {
        return "nuido";
    }
    get edgeType() {
        return Default;
    }
    get auxEdgeType() {
        return DefaultAux;
    }
    onAfterSave(newId) {
        window.location.assign(("/odoo/nuido/" + newId + "/NuidoStudio"));
    }
    async onSave() {
        const activeId = this.props.action.context.active_id;
        if (activeId) {
            const jsonDoc = this.currentDoc.toJson();
            this.orm.write(this.resModel, [activeId], {
                title: this.currentDoc.title,
                raw: jsonDoc,
                is_processed: false
            });
        }
        else {
            const res = await new Promise((resolve) => {
                this.dialog.add(TextInputDialog, {
                    title: 'Save',
                    label: 'Title',
                    initialValue: '',
                    apply: (value) => resolve(value),
                }, {
                    onClose: () => resolve("")
                });
            });
            if (res && res.trim() !== '') {
                this.currentDoc.title = res;
                const jsonDoc = this.currentDoc.toJson();
                const [newId] = await this.orm.create(this.resModel, [{
                        title: res.trim(),
                        raw: jsonDoc,
                        is_processed: false
                    }]);
                this.onAfterSave(newId);
            }
        }
    }
    deleteSelected() {
        this.state.nbus.trigger(this.channel + "/delete" /* DocumentEventType.delete */);
    }
    clearSelection() {
        this.state.nbus.trigger(this.channel + "/clear" /* SelectionEventType.clear */);
    }
    zoom_reset() {
        this.state.nbus.trigger(this.channel + "/zoom_reset" /* NuidoEventType.zoom_reset */);
    }
    translation_changed(event) {
        this.state.zoom = event.detail.zoom;
    }
    get zoom() {
        return Math.round((this.state.zoom + Number.EPSILON) * 100) / 100;
    }
}
NuidoStudio.res_model = "nuido_base.node.definition";
NuidoStudio.template = "nuido_base.studio";
NuidoStudio.components = { NuidoUi, SidebarMenu };
NuidoStudio.props = {
    ...standardActionServiceProps,
};
registry.category("actions").add("NuidoStudio", NuidoStudio);
