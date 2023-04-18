import re
import json
import urllib.parse
import base64

from . import ApiBase, Argument, ApiError


class JsonEscapeHandler(ApiBase):
    api_name = "JSON 字符串转义"
    api_description = "对输入内容进行 JSON 字符串转义，非 ASCII 字符会被转为 \\uxxxx 形式，特殊字符前会加上 \\"
    api_url = "jsonEscape"
    api_arguments = [
        Argument(name="content", required=True, description="待转义字符串", type=str)
    ]
    api_example = {"content": '123"你好世界😄"'}

    async def get(self, content: str):
        j = json.dumps(content)
        return j[1:-1]


# 以 json.decoder.py_scanstring() 为基础改出来的，
# 原版 py_scanstring 有很大篇幅在处理 JSON 规范，
# 我们这个版本遇到不符合规范的字符串直接保留原样就可以了。
# 实际上 CPython 使用的是性能更高的 c_scanstring()，但我们这里写不了 C。
def py_scanstring(s: str) -> str:
    if not s:
        return s

    FLAGS = re.VERBOSE | re.MULTILINE | re.DOTALL
    STRINGCHUNK = re.compile(r"(.*?)(\\)", FLAGS)
    BACKSLASH = {
        '"': '"',
        "\\": "\\",
        "/": "/",
        "b": "\b",
        "f": "\f",
        "n": "\n",
        "r": "\r",
        "t": "\t",
    }
    _b = BACKSLASH
    _m = STRINGCHUNK.match

    chunks = []
    _append = chunks.append
    end = 0
    while end < len(s):
        chunk: re.Match = _m(s, end)  # type: ignore
        if chunk is None:
            _append(s[end:])
            break
        end = chunk.end()
        content, terminator = chunk.groups()
        if content:
            _append(content)
        try:
            esc = s[end]
        except IndexError:
            # 字符串的最后是 \
            _append("\\")  # 错误，保留原样
            return "".join(chunks)
        if esc != "u":  # JSON 中不会有 \xXX，所以不处理
            try:
                char = _b[esc]
            except KeyError:
                # 未知的转义字符
                char = "\\" + esc  # 错误，保留原样
            end += 1
        else:
            uni = _decode_uXXXX(s, end)
            if uni is None:
                char = "\\u"  # 错误，保留原样
                end += 1
            else:
                end += 5
                if 0xD800 <= uni <= 0xDBFF:
                    if s[end : end + 2] == "\\u":
                        uni2 = _decode_uXXXX(s, end + 1)
                        if uni2 is None:
                            # 第二段失败了，第一段也视为失败
                            char = "\\u" + s[end + 1 : end + 5]  # 错误，保留原样
                        else:
                            if 0xDC00 <= uni2 <= 0xDFFF:
                                uni = 0x10000 + (
                                    ((uni - 0xD800) << 10) | (uni2 - 0xDC00)
                                )
                                end += 6
                            char = chr(uni)
                    else:
                        # 缺第二段
                        char = s[end - 6 : end]  # 错误，保留原样
                else:
                    char = chr(uni)
        _append(char)
    return "".join(chunks)


def _decode_uXXXX(s, pos):
    esc = s[pos + 1 : pos + 5]
    if len(esc) == 4 and esc[1] not in "xX":
        try:
            return int(esc, 16)
        except ValueError:
            pass


class JsonUnescapeHandler(ApiBase):
    api_name = "JSON 反转义"
    api_description = "对输入内容进行 JSON 反转义，和 JSON 转义相反"
    api_url = "jsonUnescape"
    api_arguments = [
        Argument(name="content", required=True, description="待反转义内容", type=str)
    ]
    api_example = {"content": '123\\"\\u4f60\\u597d\\u4e16\\u754c\\ud83d\\ude04\\"'}

    async def get(self, content: str):
        return py_scanstring(content)


class UrlEncodeHandler(ApiBase):
    api_name = "URL 编码"
    api_description = "对输入内容进行 URL 编码"
    api_url = "urlEncode"
    api_arguments = [
        Argument(name="content", required=True, description="待编码内容", type=str),
        Argument(
            name="encoding",
            required=False,
            description="编码",
            type=str,
            default="utf-8",
        ),
    ]
    api_example = {"content": "GB2313编码测试", "encoding": "gb2312"}

    async def get(self, content: str, encoding: str):
        try:
            r = urllib.parse.quote(content, encoding=encoding)
        except LookupError:
            raise ApiError(400, "不支持的编码")
        except UnicodeEncodeError:
            raise ApiError(400, "编码失败")
        return r


class UrlDecodeHandler(ApiBase):
    api_name = "URL 解码"
    api_description = "对输入内容进行 URL 解码"
    api_url = "urlDecode"
    api_arguments = [
        Argument(name="content", required=True, description="待解码内容", type=str),
        Argument(
            name="encoding",
            required=False,
            description="编码",
            type=str,
            default="utf-8",
        ),
    ]
    api_example = {
        "content": r"%E5%90%9B%E6%97%A5%E6%9C%AC%E8%AA%9E%E6%9C%AC%E5%BD%93%E4%B8%8A%E6%89%8B",
        "encoding": "shift-jis",
    }

    async def get(self, content: str, encoding: str):
        try:
            r = urllib.parse.unquote(content, encoding=encoding)
        except LookupError:
            raise ApiError(400, "不支持的编码")
        except UnicodeEncodeError:  # unquote(errors='replace')，不会抛这个异常
            raise ApiError(400, "编码失败")
        return r


class B64EncodeHandler(ApiBase):
    api_name = "Base64 编码"
    api_description = "对输入内容进行 Base64 编码"
    api_url = "b64encode"
    api_arguments = [
        Argument(name="content", required=True, description="待编码内容", type=str),
        Argument(
            name="encoding", required=False, description="编码", type=str, default="utf-8"
        ),
        Argument(
            name="altchars",
            required=False,
            description="Base64 编码字符",
            type=str,
            default="+/",
        ),
    ]
    api_example = {"content": "123"}

    async def get(self, content: str, encoding: str, altchars: str):
        if altchars == "+/":
            alt = None
        elif len(altchars) != 2:
            raise ApiError(400, "altchars 长度必须为 2")
        else:
            alt = altchars.encode()

        try:
            b = content.encode(encoding)
            r = base64.b64encode(b, alt).decode()
        except LookupError:
            raise ApiError(400, "不支持的编码")
        except UnicodeEncodeError:
            raise ApiError(400, "编码失败")
        return r


class B64DecodeHandler(ApiBase):
    api_name = "Base64 解码"
    api_description = "对输入内容进行 Base64 解码"
    api_url = "b64decode"
    api_arguments = [
        Argument(name="content", required=True, description="待解码内容", type=str),
        Argument(
            name="encoding",
            required=False,
            description="编码，留空则不解码",
            type=str,
            default="utf-8",
        ),
        Argument(
            name="altchars",
            required=False,
            description="Base64 编码字符",
            type=str,
            default="+/",
        ),
    ]
    api_example = {"content": "c3Nz"}

    async def get(self, content: str, encoding: str, altchars: str):
        if altchars == "+/":
            alt = None
        elif len(altchars) != 2:
            raise ApiError(400, "altchars 长度必须为 2")
        else:
            alt = altchars.encode()

        if len(content) % 4 != 0:
            content += "=" * (4 - len(content) % 4)

        try:
            r = base64.b64decode(content, alt)
        except Exception as e:
            raise ApiError(400, "Base64 解码失败: " + str(e))

        try:
            if encoding:
                r = r.decode(encoding)
        except LookupError:
            raise ApiError(400, "不支持的编码")
        except UnicodeEncodeError:
            raise ApiError(400, "解码失败")
        return r


handlers = (
    JsonEscapeHandler,
    JsonUnescapeHandler,
    UrlEncodeHandler,
    UrlDecodeHandler,
    B64EncodeHandler,
    B64DecodeHandler,
)
