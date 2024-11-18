/** @odoo-module **/

export const standardQuickboardItemProps = {
    action: { type: Object },
    itemId: { type: Number },
    theme: { type: String },
    startDate: { type: luxon.DateTime },
    endDate: { type: luxon.DateTime },
};

