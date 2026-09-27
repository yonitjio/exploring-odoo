/** @odoo-module **/
export const QUICKBOARD_BG_COLORS = {
        "def": ["#845ec2","#d65db1","#ff6f91","#ff9671","#ffc75f","#2c73d2","#0081cf","#0089ba","#008e9b","#008f7a"],
        "alt": ["#005f73","#ee9b00","#94d2bd","#ca6702","#e9d8a6","#bb3e03","#0a9396","#9b2226","#ae2012","#c0d896"],
        "cld": ["#a9d6e5","#89c2d9","#61a5c2","#468faf","#2c7da0","#2a6f97","#014f86","#01497c","#013a63","#012a4a"],
        "hot": ["#ffb950","#ffad33","#ff931f","#ff7e33","#fa5e1f","#ec3f13","#b81702","#a50104","#8e0103","#7a0103"],
        "ert": ["#bfc882","#7b4618","#a4b75c","#532a09","#647332","#915c27","#3e4c22","#ad8042","#2e401c","#bfab67"],
        "clr": ["#1f2ba0","#0063ff","#0087ff","#19b6ec","#038659","#006f26","#563c0c","#803c00","#ed9180","#ff1002"],
        "ptl": ["#66c5cc","#f6cf71","#f89c74","#dcb0f2","#87c55f","#9eb9f3","#fe88b1","#c9db74","#8be0a4","#b497e7"],
        "pur": ["#f992ad","#fbbcee","#fab4c8","#f78ecf","#cfb9f7","#e0cefd","#a480f2","#d4b0f9","#c580ed","#d199f1"]
    }

export const QUICKBOARD_FG_COLORS = {
    "def": ["#000000","#ffffff"],
    "alt": ["#000000","#ffffff"],
    "cld": ["#000000","#ffffff"],
    "hot": ["#000000","#ffffff"],
    "ert": ["#000000","#ffffff"],
    "clr": ["#000000","#ffffff"],
    "ptl": ["#000000","#ffffff"],
    "pur": ["#000000","#ffffff"]
}

export function getBackgroundColor(index, theme="def") {
    let idx = index % QUICKBOARD_BG_COLORS[theme].length;
    return QUICKBOARD_BG_COLORS[theme][idx];
}

export function getForegroundColor(index, theme="def") {
    let idx = index % QUICKBOARD_FG_COLORS[theme].length;
    return QUICKBOARD_FG_COLORS[theme][idx];
}
