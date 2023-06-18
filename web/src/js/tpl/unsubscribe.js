import $ from 'jquery';

var selectedrepos = {};
if (typeof (sessionStorage.selectedrepo) != "undefined") {
  selectedrepos = JSON.parse(sessionStorage['selectedrepo'])
  NProgress.start();
  NProgress.inc();
  $.ajax("/subscribe/{{user.id}}/get_reposinfo", {
    type: 'POST',
    data: selectedrepos,
  })
    .done(function (data) {
      $('#repotable').html(data).show()
    })
    .fail(function (jxhr) {
      $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text(jxhr.responseText);
    })
    .always(function (jxhr, textStatus) {
      if (textStatus == 'timeout' || jxhr.status == 504) {
        $('#run-result').html('<h1 class="alert alert-danger text-center">超时</h1><div class="well"></div>').show().find('div').text('前端回调获取响应超时, 请耐心等待或刷新页面后查看执行结果');
      }
      NProgress.done();
    })
} else {
  $('#run-result').html('<h1 class="alert alert-danger text-center">FAIL</h1><div class="well"></div>').show().find('div').text('请选择要退订的仓库');
}