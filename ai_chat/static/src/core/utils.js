import { useDebounced } from "@web/core/utils/timing";
import { onWillUnmount, useComponent } from "@odoo/owl";

export function useMouseListeners(options) {
    const component = useComponent();

    options.onMouseUp = (options.onMouseUp || (() => {})).bind(component);
    options.onMouseDown = (options.onMouseDown || (() => {})).bind(component);

    const onMouseMove = useDebounced(options.onMouseMove || (() => {}), "animationFrame");

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
