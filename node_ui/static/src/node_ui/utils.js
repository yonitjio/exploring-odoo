import {
    useState,
    onWillDestroy,
    onWillUnmount,
    useComponent,
    useEffect,
    reactive
} from "@odoo/owl";
import { useDebounced } from "@web/core/utils/timing";
import { makeDraggableHook } from "@web/core/utils/draggable_hook_builder_owl";
import { pick } from "@web/core/utils/objects";

/*
 * comes from o_spreadsheet.js
 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * */
export function uuidv4() {
    // mainly for jest and other browsers that do not have the crypto functionality
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
}

export function createImperativeHandle() {
    return { current: null };
}

export function useImperativeHandle(value) {
    const component = useComponent();
    useEffect(() => {
        if (component.props.handle) {
            component.props.handle.current = value;
            return () => {
                component.props.handle.current = null;
            };
        } else {
            return () => {};
        }
    });
}

export function useMousePosition() {
    const position = useState({ x: 0, y: 0 });

    function update(e) {
        position.x = e.clientX;
        position.y = e.clientY;
    }
    window.addEventListener("mousemove", update);

    onWillDestroy(() => {
        window.removeEventListener("mousemove", update);
    });

    return position;
}

export function useMouseListener(options) {
    const component = useComponent();

    options.onMouseUp = (options.onMouseUp || (() => {})).bind(component);
    options.onMouseDown = (options.onMouseDown || (() => {})).bind(component);

    const onMouseMove = useDebounced(
        options.onMouseMove || (() => {}),
        "animationFrame"
    );

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

// @ts-ignore
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

// @ts-ignore
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
        // @ts-ignore
        ctx.current.placeholder = document.createElement("div");
        // @ts-ignore
        addClass(ctx.current.placeholder, "dragged-placeholder");
        // @ts-ignore
        ctx.current.element.before(ctx.current.placeholder);
        addCleanup(() => {
            // @ts-ignore
            ctx.current.placeholder.remove();
        });
    },
    onDrop: ({ ctx, getRect }) => {
        const { top, left } = getRect(ctx.current.element);
        return { top, left };
    },
});

export function createDiv(l, t, w, h, c) {
    const el = document.createElement("div");

    el.style.position = "fixed";
    el.style.pointerEvents = "none";
    el.style.left = `${l}px`;
    el.style.top = `${t}px`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.background = c;

    return document.body.appendChild(el);
}

// https://stackoverflow.com/a/29650941
export function data2blob(data, isBase64) {
    var chars = "";

    if (isBase64) chars = atob(data);
    else chars = data;

    var bytes = new Array(chars.length);
    for (var i = 0; i < chars.length; i++) {
        bytes[i] = chars.charCodeAt(i);
    }

    var blob = new Blob([new Uint8Array(bytes)]);
    return blob;
}

export function loadFile(){
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "text/*");
        input.addEventListener("change", async () => {
            if (input.files === null || input.files.length != 1) {
                resolve(false);
            }
            else {
                resolve(input.files[0]);
            }
        });
        input.addEventListener("cancel", async () => {
            resolve(false);
        });
        input.click();
    });
}

export function makeReactive(owner, initialState, options = {}) {
    const handler = (options.onChangedHandler || (() => {}));
    // @ts-ignore
    const reactiveState = reactive(initialState, () => handler(owner, reactiveState));
    handler(owner, reactiveState);
    return reactive(initialState);
}

export function removeItem(array, id) {
    const idx = array.findIndex(o => o.id === id);
    if (idx > -1) {
        const removed = array.splice(idx, 1);
        return removed;
    }
    return null;
}

