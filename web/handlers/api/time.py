import json
import time
import datetime
import traceback

from tornado import gen
import pytz

import config
from config import delay_max_timeout
from . import ApiBase, Argument


class DelayHandler(ApiBase):
    api_name = "延时"
    api_description = "延迟指定时长"
    api_url = "delay"
    api_arguments = [
        Argument(name="seconds", required=True, description="延时时长，单位为秒", type=float)
    ]
    api_example = {"seconds": "1.5"}

    async def get(self, seconds: str | None = None):  # 兼容旧版 /util/delay/1.5 风格
        try:
            if seconds is None or seconds == "":
                fseconds: float = self.api_get_arguments()["seconds"]
            else:
                fseconds = float(seconds)  # type: ignore
        except Exception as e:
            if config.traceback_print:
                traceback.print_exc()
            await gen.sleep(0.0)
            self.write("Error, delay 0.0 second.")
            return
        if fseconds < 0:
            fseconds = 0.0
        elif fseconds >= delay_max_timeout:
            fseconds = delay_max_timeout
            await gen.sleep(fseconds)
            self.write("Error, limited by delay_max_timeout, delay {seconds} second.")
            return
        await gen.sleep(fseconds)
        self.write("delay %s second." % fseconds)
        return


class TimeStampHandler(ApiBase):
    api_name = "时间戳"
    api_description = "获取时间戳，格式化时间"
    api_url = "timestamp"
    api_arguments = [
        Argument(name="ts", required=False, description="时间戳", type=int, default=None),
        Argument(
            name="form",
            required=False,
            description="时间格式",
            type=str,
            default="%Y-%m-%d %H:%M:%S",
        ),
    ]
    api_example = {"ts": "1625068800", "form": "%Y-%m-%d %H:%M:%S"}

    async def get(self):
        Rtv = {}
        try:
            args = self.api_get_arguments()
            ts = args["ts"]  # ts = self.get_argument("ts", "")
            type = args["form"]  # type = self.get_argument("form", "%Y-%m-%d %H:%M:%S")
            cst_tz = pytz.timezone("Asia/Shanghai")
            utc_tz = pytz.timezone("UTC")
            GMT_FORMAT = "%a, %d %b %Y %H:%M:%S GMT"
            tmp = datetime.datetime.fromtimestamp

            if ts is None:
                # 当前本机时间戳, 本机时间和北京时间
                Rtv["完整时间戳"] = time.time()
                Rtv["时间戳"] = int(Rtv["完整时间戳"])
                Rtv["16位时间戳"] = int(Rtv["完整时间戳"] * 1000000)
                Rtv["本机时间"] = tmp(Rtv["完整时间戳"]).strftime(type)
                Rtv["周"] = tmp(Rtv["完整时间戳"]).strftime("%w/%W")
                Rtv["日"] = "/".join(
                    [tmp(Rtv["完整时间戳"]).strftime("%j"), yearday(tmp(Rtv["完整时间戳"]).year)]
                )
                Rtv["北京时间"] = tmp(Rtv["完整时间戳"], cst_tz).strftime(type)
                Rtv["GMT格式"] = tmp(Rtv["完整时间戳"], utc_tz).strftime(GMT_FORMAT)
                Rtv["ISO格式"] = tmp(Rtv["完整时间戳"], utc_tz).isoformat().split("+")[0] + "Z"
            else:
                # 用户时间戳转北京时间
                Rtv["时间戳"] = int(ts)
                Rtv["周"] = tmp(Rtv["时间戳"]).strftime("%w/%W")
                Rtv["日"] = "/".join(
                    [tmp(Rtv["时间戳"]).strftime("%j"), yearday(tmp(Rtv["时间戳"]).year)]
                )
                Rtv["北京时间"] = tmp(Rtv["时间戳"], cst_tz).strftime(type)
                Rtv["GMT格式"] = tmp(Rtv["时间戳"], utc_tz).strftime(GMT_FORMAT)
                Rtv["ISO格式"] = tmp(Rtv["时间戳"], utc_tz).isoformat().split("+")[0] + "Z"
            Rtv["状态"] = "200"
        except Exception as e:
            Rtv["状态"] = str(e)

        self.api_write_json(Rtv)


def yearday(year):
    if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
        return "366"
    else:
        return "365"


handlers = (
    DelayHandler,
    TimeStampHandler,
)
deprecated_handlers = (
    (r"/util/delay/(\d+)", DelayHandler),
    (r"/util/delay/(\d*\.\d+)", DelayHandler),
)
