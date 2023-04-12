import os
import json
import pkgutil
import importlib
import typing
from dataclasses import dataclass

from tornado.web import HTTPError

from ..base import BaseHandler


URL_PREFIX = "/util/"


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
    default: typing.Any = None
    """参数默认值"""


class ApiMetaclass(type):
    # 用于实现 api_url 和 api_example_randered 的元类
    def __new__(cls, name, bases, attrs):
        if name == 'ApiBase':
            return super().__new__(cls, name, bases, attrs)
        
        attrs["api_url"] = URL_PREFIX + attrs["api_url"]
        
        # 此处还可以进行 api_example 是否都在 api_arguments 中的检查
        exam = [f'{k}={v}' for k, v in attrs["api_example"].items()]
        attrs["api_example_randered"] = f'{attrs["api_url"]}?{"&".join(exam)}'
        return super().__new__(cls, name, bases, attrs)


class ApiBase(BaseHandler, metaclass=ApiMetaclass):
    api_name: str
    '''API 名称
    例如："正则表达式替换"'''
    api_url: str
    """API 的 URL，会自动加上前缀 "/util/"，支持正则表达式
    例如："regex" （加上前缀后为"/util/regex"）"""
    api_description: str
    '''API 功能说明
    例如："使用正则表达式匹配字符串"'''
    api_arguments: list[Argument] = []
    """API 的参数列表
    例如：[Argument(name="regex", required=True, description="正则表达式", type=str),
          Argument("p", required=True, "原始数据", type=str)]"""
    api_example: dict[str, str] = {}
    r"""API 示例
    例如：{'data': '数字测试1234', 'p': '(\d+)'}"""

    api_example_randered: str
    """字符串形式的 API 实例，构造函数会自动从 api_example 创建，不需要手动设置"""

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
                raise HTTPError(400, f"参数 {arg.name} 不能为空")

            args[arg.name] = value

        return args

    def api_write_json(self, data: dict[str, typing.Any], ensure_ascii=False, indent=4):
        """将 json 数据写入响应"""
        self.set_header("Content-Type", "application/json; charset=UTF-8")
        self.write(json.dumps(data, ensure_ascii=ensure_ascii, indent=indent))

    async def get(self):
        raise NotImplementedError("Must be implemented by subclass")

    async def post(self):
        raise NotImplementedError("Must be implemented by subclass")


def load_all_api() -> list[tuple[str, ApiBase]]:
    handlers: list[tuple[str, ApiBase]] = []

    path = os.path.dirname(__file__)
    for finder, name, ispkg in pkgutil.iter_modules([path]):
        module = importlib.import_module("." + name, __name__)
        # metas[name] = importlib.import_module('.api.' + name, __name__).Meta.meta
        for handler in module.handlers:
            handlers.append((handler.api_url, handler))

    return handlers


handlers = load_all_api()
