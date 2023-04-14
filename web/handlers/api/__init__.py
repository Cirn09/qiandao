import os
import json
import pkgutil
import importlib
import typing
import dataclasses
from dataclasses import dataclass

from tornado.web import HTTPError

from ..base import BaseHandler
from libs.safe_eval import safe_eval


URL_PREFIX = "/api/"


class ApiError(HTTPError):
    def __init__(self, status_code: int, reason: str, *args, **kwargs):
        # 对于 HTTPError，log_message 是打印到控制台的内容，reason 是返回给用户的内容
        # 我们希望 API 的用户可以直接从 Web 界面看到错误信息，所以将 log_message 和 reason 设置为相同的内容
        super().__init__(status_code, reason, reason=reason, *args, **kwargs)


@dataclass()
class Argument(object):
    name: str
    '''参数名称
    例如："regex"'''
    required: bool
    """参数是否必须
    调用 API 时，缺少必须参数会返回 HTTP 400 错误"""
    description: str
    '''参数描述
    例如："正则表达式"'''
    type: "type" = str
    """参数类型，默认为 str"""
    init: typing.Callable[[str], typing.Any] = None  # type: ignore
    """参数初始化函数，初始化规则如下：
    if self.init is None
        if isinstance(self.type, typing.Callable):
            self.init = self.type
        else:
            sele.init = lambda x: x
    该初始化函数原型为 init(str) -> self.type，例如 int("123"), float("123.456")等"""
    multi: bool = False
    """是否为多值参数，比如 ?a=1&a=2&a=3
    multi 为 True 时，参数值为 list，list 中每个元素都会通过 init 函数进行初始化"""
    default: typing.Any = None
    """参数默认值"""

    def __post_init__(self):
        if self.init is None:
            self.init = self.type
        if not isinstance(self.init, typing.Callable):
            self.init = lambda x: x


class ApiMetaclass(type):
    # 用于实现属性值修改和 method 装饰的元类
    def __new__(cls, name, bases, attrs):
        if name == "ApiBase":
            return super().__new__(cls, name, bases, attrs)

        attrs["api_url"] = URL_PREFIX + attrs["api_url"]

        # 此处还可以进行 api_example 是否都在 api_arguments 中的检查
        if "api_example_rendered" not in attrs and "api_example" in attrs:
            # 定义了 api_example 但是没有定义 api_example_rendered
            # 从 api_example 中生成 api_example_rendered
            exam = [f"{k}={v}" for k, v in attrs["api_example"].items()]
            attrs["api_example_rendered"] = f'{attrs["api_url"]}?{"&".join(exam)}'
        elif "api_example_rendered" in attrs:
            # 定义了 api_example_rendered（可能也定义了 api_example，
            # 这种情况下还是以 api_example_rendered 为准）
            # 补全 URL 前缀
            attrs["api_example_rendered"] = URL_PREFIX + attrs["api_example_rendered"]
        else:
            # 没有 api_example，也没有 api_example_rendered
            # 就提供个 URL 方便复制吧
            attrs["api_example_rendered"] = attrs["api_url"]

        def method_wrap(func: typing.Callable) -> typing.Callable:
            async def wrapper(self: "ApiBase") -> None:
                kwargs = self.api_get_arguments()
                ret = await func(self, **kwargs)
                filters = self.get_arguments("__filter__")
                if filters and isinstance(ret, dict):
                    filtered = {k: ret[k] for k in filters if k in ret}
                else:
                    filtered = ret
                self.api_write(filtered)

            return wrapper

        for mothed in ("get", "post", "put", "delete"):
            if mothed not in attrs:
                continue
            attrs[mothed] = method_wrap(attrs[mothed])

        return super().__new__(cls, name, bases, attrs)


class ApiBase(BaseHandler, metaclass=ApiMetaclass):
    api_name: str
    '''API 名称
    例如："正则表达式替换"'''
    api_url: str
    """API 的 URL，会自动加上前缀 "/api/"。可以使用正则表达式，但是不建议。
    例如："delay" （加上前缀后为"/api/delay"）"""
    api_description: str
    '''API 功能说明，支持 HTML 标签
    例如："使用正则表达式匹配字符串"'''
    api_arguments: typing.Sequence[Argument] = []
    """API 的参数列表
    例如：[Argument(name="seconds", required=True, description="延时时长", type=float)]"""
    api_example: dict[str, str] = {}
    r"""API 示例
    例如：{'seconds': 1.5}"""
    api_example_rendered: str
    '''API 示例的 URL，会自动从 api_url 和 api_example 中生成。
    也可以手动指定，框架会自动添加前缀 "/api/"'''

    def api_get_arguments(self) -> dict[str, typing.Any]:
        """获取 API 的所有参数"""
        args: dict[str, typing.Any] = {}

        for arg in self.api_arguments:
            init = arg.init

            if arg.multi:
                vs = self.get_arguments(arg.name)
                if arg.required and len(vs) == 0:
                    log = f"参数 {arg.name} 不能为空"
                    raise ApiError(400, log)
                value = [init(v) if v is not None else None for v in vs]
            else:
                v = self.get_argument(arg.name, arg.default)
                value = init(v) if v is not None else None
                if arg.required and value is None:
                    log = f"参数 {arg.name} 不能为空"
                    raise ApiError(400, log)
            args[arg.name] = value

        return args

    def api_write(self, data):
        if data is None:
            # 空
            return
        elif isinstance(data, typing.Dict):
            if len(data) == 1:
                # 如果只有一个键值对，直接返回值
                # 不递归处理，默认 API 不会返回过于复杂的类型
                self.write(tuple(data.values())[0])
            else:
                # 如果有多个键值对，返回 JSON
                self.api_write_json(data)
        elif isinstance(data, str):
            # str 类型直接返回
            self.write(data)
        elif isinstance(data, int) or isinstance(data, float):
            # 简单类型转为 str 返回
            self.write(str(data))
        else:
            # 其他类型转换为 JSON
            self.api_write_json(data)

    def api_write_json(self, data: dict[str, typing.Any], ensure_ascii=False, indent=4):
        """将 json 数据写入响应"""
        self.set_header("Content-Type", "application/json; charset=UTF-8")
        self.write(json.dumps(data, ensure_ascii=ensure_ascii, indent=indent))


def load_all_api() -> tuple[list[ApiBase], list[tuple[str, ApiBase]]]:
    handlers: list[tuple[str, ApiBase]] = []
    apis: list[ApiBase] = []

    path = os.path.dirname(__file__)
    for finder, name, ispkg in pkgutil.iter_modules([path]):
        module = importlib.import_module("." + name, __name__)
        if not hasattr(module, "handlers"):
            continue
        apis.extend(module.handlers)
        for handler in module.handlers:
            handlers.append((handler.api_url, handler))

    return apis, handlers


# apis 是给 about.py 看的，用于生成前端页面
# handlers 是给 handlers 看的，用于注册路由
# 其实可以合并
apis, handlers = load_all_api()
