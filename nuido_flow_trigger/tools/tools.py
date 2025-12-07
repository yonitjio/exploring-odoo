# THIS FILE IS A PART OF PUBLIC REPOSITORY https://github.com/yonitjio/exploring-odoo
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT
#
# THIS SOFTWARE IS EXPERIMENTAL AND FOR EDUCATIONAL PURPOSE ONLY.
# DO NOT USE IT IN PRODUCTION.


from typing import Literal
from dateutil.relativedelta import relativedelta

# from odoo.tools.date_utils
def get_timedelta(qty: int, granularity: Literal['minute', 'hour', 'day', 'week', 'month', 'year']):
    """ Helper to get a `relativedelta` object for the given quantity and interval unit.
    """
    switch = {
        'minute': relativedelta(minute=qty),
        'hour': relativedelta(hours=qty),
        'day': relativedelta(days=qty),
        'week': relativedelta(weeks=qty),
        'month': relativedelta(months=qty),
        'year': relativedelta(years=qty),
    }
    return switch[granularity]
