import inspect

from datetime import date, datetime, timedelta
from typing import Optional, List

import requests

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

class OdooCalendarUtility:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key

    def _post(self, path, data):
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        url = self.base_url[:-1] if self.base_url[-1] == "/" else self.base_url
        url = f"{url}/{path}"
        return requests.post(url, headers=headers, data=data)

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
        data = {
            "start_datetime": start_datetime,
            "stop_datetime": stop_datetime,
            "title": title,
            "description": description
        }
        response = self._post("frodoo/schedule/create", data)
        return response.json()

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
        data = {}
        if start_datetime is not None and stop_datetime is not None:
            data = {
                "start_datetime": start_datetime,
                "stop_datetime": stop_datetime,
            }
        elif (schedule_ids is not None) and len(schedule_ids) > 0:
            data = {
                "schedule_ids": [str(o) for o in schedule_ids],
            }
        elif not (start_datetime is not None and stop_datetime is not None) and (schedule_ids is None or len(schedule_ids) == 0):
            raise ValueError("Either schedule_ids must be specified or both start_datetime and stop_datetime must be specified.")
        else:
            raise ValueError("Invalid parameter(s).")

        response = self._post("frodoo/schedule/remove", data)
        return response.json()

    def retrieve_schedules(self, start_datetime: datetime, stop_datetime: datetime) -> list:
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
        data = {
            "start_datetime": start_datetime,
            "stop_datetime": stop_datetime
        }
        response = self._post("frodoo/schedule/list", data)
        return response.json()
