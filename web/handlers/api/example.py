from tornado.web import HTTPError

from . import ApiBase, Argument


# API 插件设计准则：
# - 路径为 /api/name（旧版保持原先的 /util/name）
# - 只允许 URL 传参（url?key=value）和 POST 传参，不允许 /delay/value 形式传参（即不允许在 URL 中使用正则）
# - 使用 HTTP 状态码标示状态，而不是 Rtv["状态"] = "200"
# - 所有的 key 都使用 ASCII 字符，而不是中英文混用
# - 返回值：简单类型直接返回（str、int、float）；
#         dict 只有一对键值对的直接返回值，多条返回值的转为 JSON 格式；
#         其他情形都转为 JSON 格式。
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
    # api_example_randered = 'echo?text=测试输入'
    # 框架会自动生成 api_example_randered，如果你对框架生成的结果不满意，可以手动设置

    async def get(self, text: str):
        # 参数名必须与 api_arguments 中的 name 一致，
        # api_arguments中的 default 会覆盖函数声明中的默认值
        return text


# 更没用的示例 API：Echon
class EchonHandler(ApiBase):
    api_name = "回显"
    api_description = "输出 = 输入*n"  # 支持 HTML 标签，比如 <br/>
    api_url = "echon"  # 框架会自动添加前缀 /api/
    api_arguments = [
        Argument(name="text", required=True, description="输入", type=str),
        Argument(name="n", required=True, description="n", type=int),
    ]
    api_example = {"text": "测试输入", "n": "3"}
    api_example_randered = 'echo?text=测试输入&n=3&__fileter__=text_0'
    

    async def get(self, text: str, n: int):
        d = {f"text_{i}": text for i in range(n)}
        return d


handlers = (EchoHandler, EchonHandler)
