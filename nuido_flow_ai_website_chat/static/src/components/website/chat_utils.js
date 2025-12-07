/*!
// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
*/
import { url } from "@web/core/utils/urls";
import { makeDraggableHook } from "@web/core/utils/draggable_hook_builder_owl";
async function loadFont(name, url) {
    await document.fonts.ready;
    if ([...document.fonts].some(({ family }) => family === name)) {
        return;
    }
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.href = url;
    link.crossOrigin = "";
    const style = document.createElement("style");
    style.appendChild(document.createTextNode(`
            @font-face {
                font-family: ${name};
                src: url('${url}') format('woff2');
                font-weight: normal;
                font-style: normal;
                font-display: block;
            }
        `));
    const loadPromise = new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", rej);
    });
    document.head.appendChild(link);
    document.head.appendChild(style);
    return loadPromise;
}
export const useMovable = makeDraggableHook({
    name: "useMovable",
    onWillStartDrag({ ctx, getRect }) {
        const { top, left } = getRect(ctx.current.element);
        ctx.current.offset_x = ctx.pointer.x - left;
        ctx.current.offset_y = ctx.pointer.y - top;
    },
    onDrag({ ctx }) {
        ctx.current.element.style.left = `${ctx.pointer.x - ctx.current.offset_x}px`;
        ctx.current.element.style.top = `${ctx.pointer.y - ctx.current.offset_y}px`;
    },
    onDrop({ ctx, getRect }) {
        const { top, left } = getRect(ctx.current.element);
        return { top, left };
    },
});
export function makeRoot(target) {
    const root = document.createElement("div");
    root.classList.add("o-nuido-flow-ai-website-chat-root");
    root.setAttribute("id", `o-nuido-flow-ai-website-chat-root-${luxon.DateTime.now().toMillis() + Math.random()}`);
    root.style.zIndex = "calc(9e999)";
    root.style.position = "relative";
    target.appendChild(root);
    return root;
}
export async function makeShadow(root) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url("/nuido/assets.css");
    const stylesLoadedPromise = new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", rej);
    });
    const shadow = root.attachShadow({ mode: "open" });
    shadow.appendChild(link);
    await Promise.all([
        stylesLoadedPromise,
        loadFont("FontAwesome", url("/nuido/font-awesome")),
        loadFont("odoo_ui_icons", url("/nuido/odoo_ui_icons")),
    ]);
    return shadow;
}
export function makeAwaitableDialog(dialog, comp, props, options) {
    return new Promise((resolve) => {
        dialog.add(comp, {
            ...props,
            getPayload: (response) => {
                resolve(response);
            },
        }, {
            ...options,
            onClose: () => resolve(),
        });
    });
}
export function makeAwaitableChatCorner(chatCornerService, props, options = {}) {
    return new Promise((resolve) => {
        chatCornerService.openChat(props, {
            ...options,
            onClose: () => resolve(),
        });
    });
}
export function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
