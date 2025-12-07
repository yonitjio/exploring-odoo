// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.

import { useEnv, useState, reactive } from "@odoo/owl";

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if ('target' in node && node instanceof HTMLElement) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener');
    }
});

export class AiMessageList {
    messages = []

    constructor(messages, userName, userAvatarUrl, assistantName, assistantAvatarUrl) {
        this.messages = messages || [];
        this.userName = userName;
        this.userAvatarUrl = userAvatarUrl;
        this.assistantName = assistantName;
        this.assistantAvatarUrl = assistantAvatarUrl;
    }

    get length(){
        return this.messages.length;
    }

    get lastMessage(){
        const length = this.messages.length;
        const message = this.messages[length - 1];
        return message;
    }

    _isString(variable) {
        return typeof variable === "string" || variable instanceof String;
    }

    _getMarked(){
        const mrk = new marked.Marked(
            markedHighlight.markedHighlight({
                emptyLangClass: 'hljs',
                langPrefix: 'hljs language-',
                highlight(code, lang, info) {
                    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                    return hljs.highlight(code, { language }).value;
                }
            })
        );

        return mrk
    }

    reset() {
        this.messages = [];
    }

    add(role, content) {
        const mrk = this._getMarked();
        const markedText = mrk.parse(content.text);

        const avatarUrl = role === "assistant" ? this.assistantAvatarUrl : this.userAvatarUrl;
        const messageOwner = role === "assistant" ? this.assistantName : this.userName;

        const chatItem = {
            name: messageOwner,
            role: role,
            avatar: avatarUrl,
            text: DOMPurify.sanitize(markedText),
            content: content,
            isProcessing: false,
        };
        const length = this.messages.push(chatItem);
        return this.messages[length - 1];
    }

    update(chatItem, content){
        const mrk = this._getMarked();

        const newMessageText = chatItem.content.text + content.text;
        const htmlMessage = mrk.parse(newMessageText, { breaks: true });
        const newMessage = DOMPurify.sanitize(htmlMessage);

        chatItem.text = newMessage;
        chatItem.content.text = newMessageText;
    }
}

export function useStore() {
    const env = useEnv();
    return useState(env.store);
}

export function createAiMessageStore(name, userName, userAvatarUrl, assistantName, assistantAvatarUrl) {
    const saveAiMessages = () => localStorage.setItem(name, JSON.stringify(aiMessagesStore.messages));
    const initialAiMessages = JSON.parse(localStorage.getItem(name) || "[]");

    initialAiMessages.forEach(msg => {
        msg.text = DOMPurify.sanitize(msg.text);
    });

    const aiMessagesStore = reactive(new AiMessageList(
            initialAiMessages,
            userName,
            userAvatarUrl,
            assistantName,
            assistantAvatarUrl
        ),
        saveAiMessages
    );
    saveAiMessages();
    return aiMessagesStore;
}
