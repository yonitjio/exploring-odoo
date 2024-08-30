# -*- coding: utf-8 -*-

import json
from datetime import datetime
from typing import List, Optional

from odoo import _, http
from odoo.http import request

from .calendar_utils import CalendarUtility


class FrodooController(http.Controller):
    @http.route('/frodoo/schedule/create', type='http', auth="api_key", methods=['POST'], csrf=False)
    def create_schedule(self, start_datetime: datetime, stop_datetime: datetime, title: str, description: str):
        util = CalendarUtility(request.env)
        res = util.create_schedule(start_datetime=start_datetime,
                                   stop_datetime=stop_datetime,
                                   title=title,
                                   description=description)
        return json.dumps(res)

    @http.route('/frodoo/schedule/remove', type='http', auth="api_key", methods=['POST'], csrf=False)
    def remove_schedule(self, schedule_ids: List[int] = None, start_datetime: Optional[datetime] = None, stop_datetime: Optional[datetime] = None):
        util = CalendarUtility(request.env)
        res = {}
        if not schedule_ids is None:
            ids = [id.strip() for id in schedule_ids.split(",")]
            res = util.remove_schedules(schedule_ids=schedule_ids)
        else:
            res = util.remove_schedules(start_datetime=start_datetime, stop_datetime=stop_datetime)
        return json.dumps(res)

    @http.route('/frodoo/schedule/list', type='http', auth="api_key", methods=['POST'], csrf=False)
    def retrieve_schedule(self, start_datetime: datetime = None, stop_datetime: datetime= None):
        util = CalendarUtility(request.env)
        res = util.retrieve_schedule(start_datetime=start_datetime, stop_datetime=stop_datetime)
        return json.dumps(res, default=str)
