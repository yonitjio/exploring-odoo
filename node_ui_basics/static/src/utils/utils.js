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

export function createDiv(l, t, w, h, c) {
    const el = document.createElement("div");

    el.className = "debug-div";
    el.style.position = "fixed";
    el.style.pointerEvents = "none";
    el.style.left = `${l}px`;
    el.style.top = `${t}px`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.background = c;

    return document.body.appendChild(el);
}