// less
import '/src/less/my.less'

// script
import $ from 'jquery'

export function deldaylog() {
  var data = {}
  data['day'] = document.getElementById("day").value;
  if (data['day'] != "") {
    $.ajax("/task/{{ task.id }}/log/del", {
      type: 'POST',
      data: data,
    })
      .done(function (data) {
        window.location.replace("/task/{{ task.id }}/log")
      })
      .fail(function (jxhr) {
        $('#run-result').html('<h1 class="alert alert-danger text-center"运行失败</h1><div class="well"></div>').show().find('div').text(jxhr.responseText);
      })
      .always(function (jqXHR, textStatus) {
        if (textStatus === "timeout" || jqXHR.status === 504) {
          $('#run-result').html('<h1 class="alert alert-danger text-center">超时</h1><div class="well"></div>').show().find('div').text('前端回调获取响应超时, 请耐心等待或刷新页面后查看执行结果');
        }
      });
  }
  return false;
}
