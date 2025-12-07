import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

from config import Config
# from agents.calendar_utils import OdooCalendarUtility
# from calendar_bot import CalendarBot
from frotts import TextToSpeech

def main():
    config = Config()

    # cal_util = OdooCalendarUtility(config.odoo_base_url, config.odoo_api_key)
    # res = cal_util.create_schedule("2024-08-26 12:00:00", "2024-08-26 13:00:00", "Test", "Test Create")
    # res = cal_util.retrieve_schedules(start_datetime="2024-08-26 12:00:00", stop_datetime="2024-08-26 13:00:00")
    # print(res)
    # cal_util.remove_schedules(start_datetime="2024-08-26 12:00:00", stop_datetime="2024-08-26 13:00:00")

    # cal_bot = CalendarBot(config=config)
    # res = cal_bot.query("Create a schedule for a meeting with John Doe tomorrow at 1pm to 2pm.")
    # print("-------------------->" + res)

    tts = TextToSpeech(config=config)
    tts.speak("Test")

if __name__ == '__main__':
    main()