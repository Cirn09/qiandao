from . import ApiBase, Argument


# 没什么用的示例 API：Echo
class EchoHandler(ApiBase):
    api_name = "回显"
    api_description = "输入即输出"
    api_url = "echo"
    api_arguments = [
        Argument(name="text", required=True, description="输入", type=str), # required 为 True 时，不要设置 default
    ]
    api_example = {"text": "测试输入"}

    async def get(self):
        # Get 请求，raw回复
        Rtv = {}
        try:
            args = self.api_get_arguments()
            text = args["text"]  # ts = self.get_argument("text", "")
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

        self.api_write_json(Rtv)


handlers = (EchoHandler,)
