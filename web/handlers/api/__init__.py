import os
import json
import pkgutil
import importlib
import typing
from dataclasses import dataclass

from tornado.web import HTTPError

from ..base import BaseHandler


URL_PREFIX = "/api/"


@dataclass(frozen=True)
class Argument(object):
    name: str
    '''参数名称
    例如："regex"'''
    required: bool
    """参数是否必须"""
    description: str
    '''参数描述
    例如："正则表达式"'''
    type: "type" = str
    """参数类型，默认为 str
    该类型必须可以从 str 类型初始化，例如 int("123"), float("123.456")"""
    multi: bool = False
    """是否为多值参数"""
    default: typing.Any = None
    """参数默认值"""


class ApiMetaclass(type):
    # 用于实现属性值修改和 method 装饰的元类
    def __new__(cls, name, bases, attrs):
        if name == "ApiBase":
            return super().__new__(cls, name, bases, attrs)

        attrs["api_url"] = URL_PREFIX + attrs["api_url"]

        # 此处还可以进行 api_example 是否都在 api_arguments 中的检查
        if "api_example_randered" not in attrs:
            exam = [f"{k}={v}" for k, v in attrs["api_example"].items()]
            attrs["api_example_randered"] = f'{attrs["api_url"]}?{"&".join(exam)}'
        else:
            attrs["api_example_randered"] = URL_PREFIX + attrs["api_example_randered"]

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
    api_arguments: list[Argument] = []
    """API 的参数列表
    例如：[Argument(name="seconds", required=True, description="延时时长", type=float)]"""
    api_example: dict[str, str] = {}
    r"""API 示例
    例如：{'seconds': 1.5}"""
    api_example_randered: str
    '''API 示例的 URL，会自动从 api_url 和 api_example 中生成。
    也可以手动指定，框架会自动添加前缀 "/api/"'''

    def api_get_arguments(self) -> dict[str, typing.Any]:
        """获取 API 的所有参数"""
        args: dict[str, typing.Any] = {}

        for arg in self.api_arguments:
            type = arg.type
            if isinstance(type, typing.Type) and isinstance(type, typing.Callable):
                v = self.get_argument(arg.name, arg.default)
                value = type(v) if v is not None else None
            else:
                value = self.get_argument(arg.name, arg.default)
            if arg.required and value is None:
                log = f"参数 {arg.name} 不能为空"
                raise HTTPError(400, log, reason=log)

            args[arg.name] = value

        return args

    def api_write(self, data):
        if isinstance(data, typing.Dict):
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

    async def get(self):
        raise NotImplementedError("Must be implemented by subclass")

    async def post(self):
        raise NotImplementedError("Must be implemented by subclass")


def load_all_api() -> tuple[list[ApiBase], list[tuple[str, ApiBase]]]:
    handlers: list[tuple[str, ApiBase]] = []
    apis: list[ApiBase] = []

    path = os.path.dirname(__file__)
    for finder, name, ispkg in pkgutil.iter_modules([path]):
        module = importlib.import_module("." + name, __name__)
        # metas[name] = importlib.import_module('.api.' + name, __name__).Meta.meta
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
