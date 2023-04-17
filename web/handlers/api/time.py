import time, datetime

import pytz
from tornado.gen import sleep as asleep

from . import ApiBase, Argument, ApiError

from config import delay_max_timeout


class DelayHandler(ApiBase):
    api_name = "延时"
    api_description = "延迟指定时间"
    api_url = "delay"
    api_arguments = (
        Argument(
            name="seconds",
            required=True,
            description=f"延迟时间（秒）,最长 {delay_max_timeout} 秒",
            type=float,
        ),  # , init = lambda x: float(x) % 30
    )
    api_example = {"seconds": 1.5}

    async def get(self, seconds: float):
        if seconds < 0.0:
            raise ApiError(400, "延迟时长必须为正数")
        if seconds > delay_max_timeout:
            raise ApiError(400, f"延迟时长不能超过 {delay_max_timeout} 秒")
        await asleep(seconds)
        return f"delay {seconds} seconds"


class TimestampHandler(ApiBase):
    api_name = "时间戳"
    api_description = "获取时间戳，格式化时间"
    api_url = "timestamp"
    api_arguments = [
        Argument(
            name="timestamp",
            required=False,
            description="时间戳",
            type=float,
            default=None,
            default_disp="当前时间",
        ),
        Argument(
            name="format",
            required=False,
            description="""时间格式，参考 <a href="https://docs.python.org/zh-cn/3/library/datetime.html?highlight=timedate#strftime-and-strptime-format-codes" target="_blank" >Format codes</a>""",
            type=str,
            default="%Y-%m-%d %H:%M:%S",
        ),
        Argument(
            name="tz",
            required=False,
            description="时区",
            default="Asia/Shanghai",  # default = pytz.timezone("Asia/Shanghai"),
            type=str,
            init=pytz.timezone,
        ),
    ]
    api_example = {"timestamp": 1625068800, "format": "%Y-%m-%d %H:%M:%S"}

    async def get(self, timestamp: float | None, format: str, tz: datetime.tzinfo):
        if timestamp is None:
            timestamp = time.time()
        dt_tz = datetime.datetime.fromtimestamp(timestamp, tz)

        r = {
            "timestamp": timestamp,
            "formated": dt_tz.strftime(format),
            "daysOfYear": yearday(dt_tz.year),
        }

        return r


def yearday(year):
    if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
        return "366"
    else:
        return "365"


handlers = (DelayHandler, TimestampHandler)
