/*!
 * THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
 *
 * This software is released under the MIT License.
 * SPDX-License-Identifier: MIT
 * https://opensource.org/licenses/MIT
 *
 * THIS SOFTWARE IS EXPERIMENTAL, NO GUARANTEES OR LIABILITY ASSUMED.
 *
 */

import { t } from "@odoo/owl";

const { DateTime } = luxon;

export const standardQuickboardItemProps = {
    action: t.object(),
    itemId: t.number(),
    theme: t.string(),
    startDate: t.instanceOf(DateTime),
    endDate: t.instanceOf(DateTime),
};

