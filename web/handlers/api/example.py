from . import ApiBase, Argument


# 没什么用的示例 API：Echo
# /util/echo?text=xxx 格式
class EchoHandler(ApiBase):
    api_name = "回显"
    api_description = "输入即输出"
    api_url = "echo"
    api_arguments = [
        Argument(
            name="text", required=True, description="输入", type=str
        ),  # required 为 True 时，不要设置 default
    ]
    api_example = {"text": "测试输入"}

    async def get(self):
        # Get 请求，raw回复
        Rtv = {}
        try:
            # 可以通过 api_get_arguments 获取所有在 api_arguments 中定义的参数
            args = self.api_get_arguments()
            text = args["text"]
            # ts = self.get_argument("text", "") # 也可以通过 get_argument 获取
            self.write(text)
        except Exception as e:
            self.write(str(e))

    async def post(self):
        # Post 请求，json回复
        Rtv = {}
        try:
            args = self.api_get_arguments()
            text = args["text"]  # ts = self.get_argument("text", "")
            Rtv["text"] = text
        except Exception as e:
            Rtv["状态"] = str(e)

        self.api_write_json(Rtv)  # 可以通过 api_write_json 返回 json 格式的数据，它会自动设置 http header


# 没什么用的示例 API：Echo
# 不推荐使用的 util/echo/xxx 格式
class Echo2Handler(ApiBase):
    api_name = "回显"
    api_description = "输入即输出"
    api_url = "echo/(.*)"
    api_url_disp = "echo"
    api_example_randered = "echo/测试输入"

    async def get(self, text):
        self.write(text)


handlers = (EchoHandler, Echo2Handler)
