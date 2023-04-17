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
            name="seconds", required=True, description=f"延迟时间（秒）,最长 {delay_max_timeout} 秒", type=float
        ),  # , init = lambda x: float(x) % 30
    )
    api_example = {"seconds": "1.5"}

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
            description="""时间格式<br/>
%y 两位数的年份表示（00-99）<br/>
%Y 四位数的年份表示（000-9999）<br/>
%m 月份（01-12）<br/>
%d 月内中的一天（0-31）<br/>
%H 24小时制小时数（0-23）<br/>
%I 12小时制小时数（01-12）<br/>
%M 分钟数（00=59）<br/>
%S 秒（00-59）<br/>
%a 本地简化星期名称<br/>
%A 本地完整星期名称<br/>
%b 本地简化的月份名称<br/>
%B 本地完整的月份名称<br/>
%c 本地相应的日期表示和时间表示<br/>
%j 年内的一天（001-366）<br/>
%p 本地A.M.或P.M.的等价符<br/>
%U 一年中的星期数（00-53）星期天为星期的开始<br/>
%w 星期（0-6），星期天为星期的开始<br/>
%W 一年中的星期数（00-53）星期一为星期的开始<br/>
%x 本地相应的日期表示<br/>
%X 本地相应的时间表示<br/>
%Z 当前时区的名称<br/>
""",
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
    api_example = {"timestamp": "1625068800", "format": "%Y-%m-%d %H:%M:%S"}

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
