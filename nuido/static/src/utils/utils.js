// THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
//
// THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
// DO NOT USE IT IN PRODUCTION.
import { reactive, onWillUnmount, useComponent } from "@odoo/owl";
import { useDebounced } from "@web/core/utils/timing";
import { makeDraggableHook } from "@web/core/utils/draggable_hook_builder_owl";
import { pick } from "@web/core/utils/objects";
export function makeReactive(owner, initialState, handler = () => { }) {
    const reactiveState = reactive(initialState, () => handler(owner, reactiveState));
    handler(owner, reactiveState);
    return reactive(initialState);
}
export function uuidv4() {
    // mainly for jest and other browsers that do not have the crypto functionality
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
export function removeItem(array, id) {
    const idx = array.findIndex(o => o.id === id);
    if (idx > -1) {
        const removed = array.splice(idx, 1);
        return removed;
    }
    return null;
}
export function useMouseListener(options) {
    const component = useComponent();
    options.onMouseUp = (options.onMouseUp || (() => { })).bind(component);
    options.onMouseDown = (options.onMouseDown || (() => { })).bind(component);
    const onMouseMove = useDebounced(options.onMouseMove || (() => { }), "animationFrame");
    const onMouseUp = (event) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        onMouseMove.cancel(true);
        options.onMouseUp(event);
    };
    onWillUnmount(() => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    });
    return (event) => {
        options.onMouseDown(event);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp, { once: true });
    };
}
export const useMovable = makeDraggableHook({
    name: "useMovable",
    onWillStartDrag: ({ ctx, addCleanup, addStyle, addClass }) => {
        addClass(ctx.current.element, "dragging");
        ctx.current.container = document.createElement("div");
        addStyle(ctx.current.container, {
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        });
        ctx.current.element.after(ctx.current.container);
        addCleanup(() => {
            ctx.current.container.remove();
        });
        return { ctx };
    },
    onDragStart: ({ ctx, addCleanup, addClass }) => {
        ctx.current.placeholder = document.createElement("div");
        addClass(ctx.current.placeholder, "dragged-placeholder");
        ctx.current.element.before(ctx.current.placeholder);
        addCleanup(() => {
            ctx.current.placeholder.remove();
        });
    },
    onDrop: ({ ctx, getRect }) => {
        document.body.style.cursor = "default";
        const { top, left } = getRect(ctx.current.element);
        return { top, left };
    },
});
export const useDraggable = makeDraggableHook({
    name: "useDraggable",
    onComputeParams({ ctx }) {
        ctx.followCursor = false;
    },
    onWillStartDrag: ({ ctx }) => pick(ctx.current, "element"),
    onDragStart: ({ ctx }) => pick(ctx.current, "element"),
    onDrag: ({ ctx }) => pick(ctx.current, "element"),
    onDrop: ({ ctx }) => pick(ctx.current, "element"),
});
// https://stackoverflow.com/a/29650941
export function data2blob(data, isBase64 = false) {
    var chars = "";
    if (isBase64)
        chars = atob(data);
    else
        chars = data;
    var bytes = new Array(chars.length);
    for (var i = 0; i < chars.length; i++) {
        bytes[i] = chars.charCodeAt(i);
    }
    var blob = new Blob([new Uint8Array(bytes)]);
    return blob;
}
export function loadFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "text/*");
        input.addEventListener("change", async () => {
            if (input.files === null || input.files.length != 1) {
                resolve(undefined);
            }
            else {
                resolve(input.files[0]);
            }
        });
        input.addEventListener("cancel", async () => {
            resolve(undefined);
        });
        input.click();
    });
}
export function isOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    // (left1 < right2 && right1 > left2 && top1 < bottom2 && bottom1 > top2 ){
    return (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2);
}
