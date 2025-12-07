// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.

/** @odoo-module **/
import { Component, useState, useRef, useSubEnv, onWillUpdateProps, onWillUnmount, onMounted } from "@odoo/owl";
import { useBus } from "@web/core/utils/hooks";

import { FileUploader } from "@web/views/fields/file_handler";

import { AiMessage } from "./ai_message";
import { useStore, createAiMessageStore } from "./ai_message_store";

export class AiChat extends Component {
    static template = "ai_chat_base.AiChat";
    static components = {
        AiMessage,
        FileUploader
    };
    static props = {
        greetingMessage: { type: String, optional: true },
        greetUser: { type: Boolean, optional: true },

        userName: { type: String },
        userAvatarUrl: { type: String },

        assistantName: { type: String },
        assistantAvatarUrl: { type: String },

        isProcessing: { type: Boolean },
        storeName: { type: String },

        channel: { type: String },
        bus: { type: Object },

        onBeforeSendMessage: { type: Function },
        onSendMessage: { type: Function },

        allowUpload: { type: Boolean, optional: true }
    };

    static defaultProps = {
        greetUser: false,
        greetingMessage: "",
        allowUpload: false
    }

    setup() {
        super.setup();

        useSubEnv({
            store: createAiMessageStore(this.props.storeName,
                    this.props.userName,
                    this.props.userAvatarUrl,
                    this.props.assistantName,
                    this.props.assistantAvatarUrl
                )
        });

        this.store = useStore();

        this._greetUser();

        this.aiChatInputRef = useRef("ai-chat-input");
        this.aiChatMessagesRef = useRef("ai-chat-messages");

        this.state = useState({
            attachments: []
        })

        onWillUpdateProps(nextProps => {
            const lastMessage = this.store.lastMessage;
            if (lastMessage){
                lastMessage.isProcessing = nextProps.isProcessing;
                if (!lastMessage.isProcessing) {
                    setTimeout(() => this.aiChatInputRef.el.focus(), 100);
                }
            }
        });

        useBus(this.props.bus, this.props.channel + "/message", this.onReceiveMessage.bind(this));
        useBus(this.props.bus, this.props.channel + "/reset", this.onReset.bind(this));
    }

    _greetUser(){
        if (this.props.greetUser) {
            if (this.store.length == 0){
                if (this.props.greetingMessage){
                    this.store.add("assistant", this.props.greetingMessage);
                }
            }
        }
    }

    _reset() {
        if (this.props.isProcessing) {
            return;
        }

        this.store.reset();

        this._greetUser();

        this.state.attachments = []
    }

    _update(message) {
        if (this.props.isProcessing) {
            const msg = this.store.lastMessage;
            this.store.update(msg, message);
        }
    }

    onReset() {
        this._reset();
    }

    onReceiveMessage(ev) {
        this._update(ev.detail.message);
    }

    sendMessage() {
        const text = this.aiChatInputRef.el.value;
        if (text === ""){
            return;
        }
        if (!this.props.onBeforeSendMessage()){
            return;
        }

        const history = this.store.messages;

        let userMessage = {
            text: text,
            attachments: this.state.attachments
        }

        let assistantMessage = {
            text: "",
            attachments: []
        }

        this.store.add("user", userMessage);
        this.store.add("assistant", assistantMessage);

        this.props.onSendMessage(userMessage, history);

        this.aiChatInputRef.el.value = "";
        this.state.attachments = []

        this.aiChatMessagesRef.el.scrollTop = this.aiChatMessagesRef.el.scrollHeight;
    }

    onKeydown(ev) {
        switch (ev.key) {
            case "Enter": {
                if (ev.shiftKey) {
                    this.sendMessage();
                    ev.preventDefault();
                }
            }
        }
    }

    getImageSource(attachment){
        return `data:${attachment.type};base64,${attachment.data}`
    }

    uploadAttachment(attachment) {
        console.log(attachment);
        this.state.attachments.push(attachment);
        console.log(this.state.attachments.length);
    }

    removeAttachment(idx){
        this.state.attachments.splice(idx, 1);
    }
}
