import json
from typing import Any


from . import ApiBase, Argument, safe_eval, ApiError


# API 插件设计准则：
# - 路径为 /api/name（旧版保持原先的 /util/name）
# - 使用 HTTP 状态码标示状态，而不是 Rtv["状态"] = "200"
#   - 调用 API 时，缺少必须参数会自动返回 HTTP 400 错误
#   - 处理请求时，未被处理的异常会自动返回 HTTP 500 错误
#   - 访问未实现的 API method 会自动返回 HTTP 405 错误。如只实现了 GET 时访问 POST。
#       如果 POST 和 GET 实现完全相同，可以在 get 函数后写上 post = get
#   - 建议使用 `raise ApiError(status_code, reason)` 设置异常代码和原因（见 ExampleErrorHandler）
# - 允许 URL 传参（url?key=value）和 POST form 传参，不允许 /delay/value 形式传参（即不允许在 URL 中使用正则），
#   不建议使用 POST JSON 传参（见 JSONHandler）
# - 参数尽量使用简单类型，参数的初始化函数尽量使用内置函数，使用 safe_eval 代替 eval，避免使用 safe_eval
# - 所有的 key 都使用 ASCII 字符，而不是中英文混用
# - 返回值：简单类型直接返回（str、int、float）；
#         dict 只有一对键值对的直接返回值，多条返回值的转为 JSON 格式；
#         bytes 类型会设置 Content-Type: application/octet-stream 头，然后直接返回；
#         其他情形都转为 JSON 格式。
#         如果希望避免不可控，可以将返回值处理为 str 类型。
#     支持传参 `__filter__` 对返回 JSON 进行过滤，过滤后只剩一对的，直接返回值。
#     例：
#     ```
#     > api://api/timestamp
#     < {"timestamp": 1625068800, "weak": "4/26", day: "182/165", ...}
#
#     > api://api/timestamp?__fileter__=timestamp
#     < 1625068800
#
#     > api://api/timestamp?__fileter__=timestamp&__fileter__=weak
#     < {"timestamp": 1625068800, "weak": "4/26"}
#     ```
# - 其他规范见 ApiBase 和 Argument 源码


# 没什么用的示例 API：Echo
class EchoHandler(ApiBase):
    # 各属性的意义参见 ApiBase 各属性的 docstring
    api_name = "回显"
    api_description = "输出 = 输入"  # 支持 HTML 标签，比如 <br/>
    api_url = "echo"  # 框架会自动添加前缀 /api/
    api_arguments = [
        Argument(
            name="text", required=True, description="输入", type=str
        ),  # required 为 True 时，不要设置 default
    ]
    api_example = {"text": "测试输入"}
    # api_example_rendered = 'echo?text=测试输入'
    # 框架会自动生成 api_example_rendered，如果你对框架生成的结果不满意，可以手动设置

    async def get(self, text: str):
        # 参数名必须与 api_arguments 中的 name 一致，
        # api_arguments中的 default 会覆盖函数声明中的默认值
        return text


# 用于演示 filter 的示例 API：Echon
class EchonHandler(ApiBase):
    api_name = "回显"
    api_description = "输出 = 输入*n"  # 支持 HTML 标签，比如 <br/>
    api_url = "echon"  # 框架会自动添加前缀 /api/
    api_arguments = [
        Argument(name="text", required=True, description="输入", type=str),
        Argument(name="n", required=True, description="n", type=int),
    ]
    api_example = {"text": "测试输入", "n": 3}
    api_example_rendered = "echon?text=测试输入&n=3&__filter__=text_0"

    async def get(self, text: str, n: int):
        d = {f"text_{i}": text for i in range(n)}
        return d


# 用于演示 multi 的示例 API：Sum
class SumHandler(ApiBase):
    api_name = "累加"
    api_description = "输出 = sum(输入)"  # 支持 HTML 标签，比如 <br/>
    api_url = "sum"  # 框架会自动添加前缀 /api/
    api_arguments = [
        Argument(name="input", required=True, description="输入", type=int, multi=True),
    ]
    api_example = {"input": [1, 2, 9]}  # 传入的参数都是 str 类型，框架会自动根据 Argument 的声明进行转换

    async def get(self, input: list[int]):
        return sum(input)


# 用于演示 multi 的示例 API：Concat
class ConcatHandler(ApiBase):
    api_name = "连接"
    api_description = "输出 = sep.join(text)"  # 支持 HTML 标签，比如 <br/>
    api_url = "concat"  # 框架会自动添加前缀 /api/
    api_arguments = [
        Argument(name="texts", required=True, description="输入", type=str, multi=True),
        Argument(name="sep", required=True, description="n", type=str),
    ]
    api_example = {"texts": ["1", "2", "9"], "sep": ","}

    async def get(self, texts: list[str], sep: str):
        return sep.join(texts)


# 使用 safe_eval 的示例 API
# 禁止使用 eval，safe_eval 也不建议使用
class ExampleEvalHandler(ApiBase):
    api_name = "example eval"
    api_description = "输出 = eval(obj)"  # 支持 HTML 标签，比如 <br/>
    api_url = "exam_eval"  # 框架会自动添加前缀 /api/
    api_arguments = [
        Argument(name="obj", required=True, description="输入", type=Any, init=safe_eval)
    ]
    api_example = {"obj": "[(1,2,'3'), {'a': 1, 9: None}]"}

    async def get(self, obj: Any):
        return obj  # example 给出的 obj 是 list 类型，返回值会被转为 JSON


# 复杂类型的示例
class Example2Handler(ApiBase):
    class ArgType(object):
        def __init__(self, s: str):  # 构造函数参数必须是一个 str
            ss = s.split(",")[-1]
            self.v = int(ss)

    api_name = "example 2"
    api_description = "输出 = class(obj)"  # 支持 HTML 标签，比如 <br/>
    api_url = "exam2"  # 框架会自动添加前缀 /api/
    api_arguments = [
        Argument(name="obj", required=True, description="输入", type=ArgType)
    ]
    api_example = {"obj": "1,2,3,4,5,6,7,8,9"}

    async def get(self, obj: ArgType):
        return obj.v


# 异常示例
class ExampleErrorHandler(ApiBase):
    api_name = "异常"
    api_description = "引发异常的示例"
    api_url = "error"
    api_arguments = (
        Argument("code", False, "错误代码", int, default=400),
        Argument("reason", False, "错误原因", str, default="测试错误"),
    )
    api_example = {"code": 400, "reason": "测试错误"}

    async def get(self, code: int, reason: str):
        if code == 999:
            eee = 9 / 0
        raise ApiError(code, reason)


class JSONHandler(ApiBase):
    api_name = "json echo"
    api_description = "POST JSON 传参示例"
    api_url = "json"
    api_arguments = [
        Argument(name="indent", required=False, description="缩进", type=int, default=4),
        Argument(
            name="data",
            required=True,
            description="输入 JSON",
            type=json,
            init=json.loads,
            from_body=True,
        ),
    ]

    async def post(self, data: dict, indent: int):
        self.api_write_json(data, indent=indent)  # 使用 self.api_write_json() 不会受到 __filter__ 影响


handlers = (
    EchoHandler,
    EchonHandler,
    SumHandler,
    ConcatHandler,
    ExampleEvalHandler,
    Example2Handler,
    ExampleErrorHandler,
    JSONHandler,
)
