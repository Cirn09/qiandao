// less
import '/src/less/my.less'

// script
var bar = 0.0
var finish = false;
update_req();
function count(finish) {
    if (finish) { NProgress.done(); return; }
    bar = bar + 0.01;
    NProgress.inc();
}
function update_error_msg(msg) {
  if ($("#error-msg").hasClass("well")) {
    $("#error-msg").append("<br>" + msg);
  } else {
    $("#error-msg").addClass("well").html(msg);
  }
  var div = document.getElementById('error-msg');
  div.scrollTop = div.scrollHeight;
}
function update_req() {
    NProgress.start();
    count(finish);
    function ws_relative_url(s) {
      var l = window.location;
      return ((l.protocol === "https:") ? "wss://" : "ws://") + l.hostname + (((l.port != 80) && (l.port != 443)) ? ":" + l.port : "") + s;
  }
    ws = new WebSocket(ws_relative_url("/subscribe/{{ userid }}/updating/"));
    if (!ws) {
      $("#update_loading").html("当前浏览器不支持WebSocket, 请更换浏览器重试, 请勿连续刷新！").show();
      finish = true;
      count(finish);
      return;
    }
    ws.onopen = function () {
      $("#update_loading").html("正在更新公共模板, 请稍候.......").show();
    };
    ws.onmessage = function (evt) {
      var _json = JSON.parse(evt.data);
      if (_json.message != "") {
        update_error_msg(_json.message);
        count(finish);
      }
    };
    ws.onclose = function (evt) {
        if (evt.code == 1005 && evt.reason == "") {
            update_error_msg("错误代码：" + evt.code + ", <br>错误原因：服务器主动断开连接<br>1s 后尝试重新连接...");
            setTimeout(function () {
                update_req();
            }, 1000);
        } else if (evt.code == 1000) {
            $("#update_loading").html("更新公共模板成功, 正在跳转, 请稍候......").show();
            setTimeout(function () {
                window.location.href = "/subscribe/{{ userid }}/";
            }, 1000);
        } else{
          if (evt.code == 1001) {
            $("#update_loading").html("更新公共模板中断, 请勿重复刷新！").show();
          } else {
            $("#update_loading").html("更新公共模板失败, 请稍后刷新重试, 请勿连续刷新！").show();
          }
          update_error_msg("错误代码：" + evt.code + ", <br>错误原因：" + evt.reason);
        }
        finish = true;
        count(finish)
    };
    ws.onerror = function (evt) {
        $("#update_loading").html("更新公共模板失败, 请稍后刷新重试, 请勿连续刷新！").show();
        if (evt.code == 1005 && evt.reason == "") {
          update_error_msg("错误代码：" + evt.code + ", <br>错误原因：服务器主动断开连接<br>1s 后尝试重新连接...");
          setTimeout(function () {
              update_req();
          }, 1000);
        } else if (evt.code == 1006 && evt.reason == "") {
          update_error_msg("错误代码：" + evt.code + ", <br>错误原因：服务器主动断开连接");
        } else if (evt.code == 1006 && evt.reason != "") {
          update_error_msg("错误代码：" + evt.code + ", <br>错误原因：" + evt.reason);
        } else {
          update_error_msg("错误代码：" + evt.code + ", <br>错误原因：" + evt.reason);
        }
        finish = true;
        count(finish)
    };
    return;
}