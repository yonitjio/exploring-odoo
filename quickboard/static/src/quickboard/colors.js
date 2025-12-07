/** @odoo-module **/
const QUICKBOARD_COLORS = [
    "#845ec2",
    "#d65db1",
    "#ff6f91",
    "#ff9671",
    "#ffc75f",
    "#2c73d2",
    "#0081cf",
    "#0089ba",
    "#008e9b",
    "#008f7a",
    "#4b4453",
    "#b0a8b9",
    "#c34a36",
    "#ff8066",
    "#009efa",
    "#3596b5",
    "#9b89b3",
    "#ff8066",
];

export function getColor(index) {
    return QUICKBOARD_COLORS[index % QUICKBOARD_COLORS.length];
}
