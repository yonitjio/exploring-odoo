# -*- coding: utf-8 -*-

import inspect
import time
from datetime import date, datetime, timedelta
from typing import Optional, List
from pydantic import ValidationError

from odoo.tools import DEFAULT_SERVER_DATETIME_FORMAT

def get_function_header(func):
    return f"{inspect.getdoc(func)}"

def get_date(delta: int) -> dict:
    """
    Gets date relative to today's date. Returns date information along with full weekday name and full month name of the date.
    Use 0 as arguments for current date.

    Args:
        delta (int): Day difference from today, i.e., 0 is today, 1 is tomorrow, 2 is the day after tomorrow and so on.

    Returns:
        dict: Dictionary containing information about the requested date.
            keys:
                - 'date':  The result date in format Year-Month-Day e.g., '2024-01-25'
                - 'day': Full weekday name of the result date.
                - 'month': Full month name of the result date.
    """
    dt = date.today() + timedelta(days=delta)
    dt_str = dt.strftime("%Y-%m-%d")
    day_name = dt.strftime("%A")
    month_name = dt.strftime("%B")
    result = {
        "name": "get_date",
        "content": {"date": dt_str, "day": day_name, "month": month_name}
    }
    return result

class CalendarUtility:
    def __init__(self, env):
        self.env = env

    def _add_system_timezone(self, dt, reverse = False) -> datetime:
        system_tz = (time.timezone if (time.localtime().tm_isdst == 0) else time.altzone) / 60 / 60 * -1

        if reverse:
            system_tz = system_tz * -1

        if isinstance(dt, str):
            dt_tz = datetime.strptime(dt, DEFAULT_SERVER_DATETIME_FORMAT)
        elif isinstance(dt, datetime):
            dt_tz = dt

        dt_tz = dt_tz + timedelta(hours=system_tz)

        return dt_tz

    def _create_link(self, schedule_id, title):
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        menu_id = self.env.ref('calendar.calendar_event_menu').id
        link = f"[{title}]({base_url}/web#menu_id={menu_id}&model=calendar.event&view_type=form&id={schedule_id})"
        return link

    def create_schedule(self, start_datetime: datetime, stop_datetime: datetime, title: str, description: str) -> dict:
        """Create schedule on user's calendar.

        Args:
            start_datetime (datetime): Starting date and time for the schedule.
            stop_datetime (datetime): Stop date and time for the schedule.
            title (str): Title for the schedule.
            description (str): Short description to explain the schedule.

        Returns:
            dict: a dictionary containing the record id and url to view the schedule
                keys:
                    - 'id': Record id for the created schedule.
                    - 'markdown_link': link to view the created schedule in markdown format.
        """
        start_dt: datetime = self._add_system_timezone(start_datetime, reverse=True)
        stop_dt: datetime = self._add_system_timezone(stop_datetime, reverse=True)

        calendar_event = self.env['calendar.event']
        schedule = calendar_event.create({
            'privacy': 'private',
            'name': title,
            'description': description,
            'start': start_dt.strftime(DEFAULT_SERVER_DATETIME_FORMAT),
            'stop': stop_dt.strftime(DEFAULT_SERVER_DATETIME_FORMAT),
        })

        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        menu_id = self.env.ref('calendar.calendar_event_menu').id
        vals = {
            "id": schedule.id,
            "markdown_link": f"[{title}]({base_url}/web#menu_id={menu_id}&model=calendar.event&view_type=form&id={schedule.id})"
        }
        return vals

    def edit_schedule(self, schedule_id: int,
                      start_datetime: Optional[datetime] = None,
                      stop_datetime: Optional[datetime] = None,
                      title: Optional[str] = None,
                      description: Optional[str] = None):
        """Edit user's schedule.

        Args:
            schedule_id (int): Database record id of the schedule.
            start_datetime (datetime): Starting date and time for the schedule.
            stop_datetime (datetime): Stop date and time for the schedule.
            title (str): Title for the schedule.
            description (str): Short description to explain the schedule.

        Returns:
            dict: a dictionary containing the record id and url to view the schedule
                keys:
                    - 'id': Record id for the created schedule.
                    - 'markdown_link': link to view the created schedule in markdown format.
        """
        calendar_event = self.env["calendar.event"].browse(schedule_id)
        if calendar_event is None:
            raise ValidationError("Invalid schedule Id.")

        vals = {}
        if start_datetime is not None:
            start_dt = self._add_system_timezone(start_datetime, reverse=True)
            if start_dt != calendar_event["start"] != start_datetime:
                vals["start"] = start_dt

        if stop_datetime is not None:
            stop_dt = self._add_system_timezone(stop_datetime, reverse=True)
            if stop_dt != calendar_event["start"] != stop_datetime:
                vals["stop"] = stop_dt

        if title is not None and title != calendar_event["name"]:
            vals["name"] = title

        if description is not None and description != calendar_event["description"]:
            vals["description"] = description

        calendar_event.write(vals)

        vals = {
            "id": schedule_id,
            "markdown_link": self._create_link(schedule_id=schedule_id, title=title)
        }
        return vals

    def remove_schedules(self, schedule_ids: List[int] = None, start_datetime: Optional[datetime] = None, stop_datetime: Optional[datetime] = None):
        """Remove user's schedule.
        Either specify the id of schedules to be removed
        or provide start and stop datetimes to remove all schedules between them.

        Args:
            schedule_ids (list): List of database record id of the schedule.
            start_datetime: Starting date and time.
            stop_datetime: Stop date and time.
        Returns:
            dict: a dictionary containing the result of the function execution
                keys:
                    - 'result': 0 if success, -1 if failed.
                    - 'error_message': Contains error message if failed, empty if success.
        """
        result = 0
        error = ""
        try:
            if start_datetime is not None and stop_datetime is not None:
                start_dt: datetime = self._add_system_timezone(start_datetime, reverse=True)
                stop_dt: datetime = self._add_system_timezone(stop_datetime, reverse=True)

                result = []
                calendar_event = self.env["calendar.event"]
                search_result = calendar_event.search([("start", ">=", start_dt.strftime(DEFAULT_SERVER_DATETIME_FORMAT)),
                                            ("stop", "<=", stop_dt.strftime(DEFAULT_SERVER_DATETIME_FORMAT))])
                for res in search_result:
                    res.unlink()
            elif not (start_datetime is not None and stop_datetime is not None) and (schedule_ids is None or len(schedule_ids) == 0):
                raise ValidationError("Either schedule_ids must be specified or both start_datetime and stop_datetime must be specified.")
            elif (schedule_ids is not None) and len(schedule_ids) > 0:
                for id in schedule_ids:
                    calendar_event = self.env["calendar.event"].browse(id)
                    if calendar_event is None:
                        raise ValidationError("Invalid schedule Id.")

                    calendar_event.unlink()
            else:
                raise ValidationError("Either schedule_ids must be specified or both start_datetime and stop_datetime must be specified.")
        except Exception as e:
            result = -1
            error = str(e)

        vals = {
            "result": result,
            "error_message": error
        }
        return vals

    def retrieve_schedule(self, start_datetime: datetime, stop_datetime: datetime) -> list:
        """List user's schedules.

        Args:
            start_datetime (datetime): Starting date and time of the list.
            stop_datetime (datetime): Stop date and time of the list.

        Returns:
            list: list of dictionary objects.
                dict: dictionary containing user's schedule data.
                    keys:
                        - 'schedule_id': Database record id of the schedule.
                        - 'start_datetime': Starting date and time of the schedule.
                        - 'stop_datetime': stop date and time of the schedule.
                        - 'title': Title of the schedule.
                        - 'description': Short description of the schedule.
                        - 'markdown_link': link to view the created schedule in markdown format.
        """
        start_dt: datetime = self._add_system_timezone(start_datetime, reverse=True)
        stop_dt: datetime = self._add_system_timezone(stop_datetime, reverse=True)

        result = []
        calendar_event = self.env["calendar.event"]
        search_result = calendar_event.search([("start", ">=", start_dt.strftime(DEFAULT_SERVER_DATETIME_FORMAT)),
                                    ("stop", "<=", stop_dt.strftime(DEFAULT_SERVER_DATETIME_FORMAT))],
                                    order="id asc")
        for res in search_result:
            start_dt = self._add_system_timezone(res.start)
            stop_dt = self._add_system_timezone(res.stop)
            result.append({
                "id": res.id,
                "start_datetime": start_dt,
                "stop_datetime": stop_dt,
                "title": res.name,
                "description": res.description if res.description else '',
                "markdown_link": self._create_link(res.id, title=res.name)
            })
        return result
