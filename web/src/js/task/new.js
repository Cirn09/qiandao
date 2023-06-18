import $ from 'jquery';

$(function () {
  // run test
  $('#run').on('click', function () {
    var tplid = $('select[name=_binux_tplid]').val();
    var env = {};
    for (var _env = $('form').serializeArray(), i = _env.length - 1; i >= 0; i--) {
      env[_env[i].name] = _env[i].value;
    }
    var data = {
      env: JSON.stringify(env),
      _binux_tplid: tplid,
    }

    var $this = $(this);
    $this.button('loading');
    $.ajax('/tpl/run', {
      type: 'POST',
      data: data,
    })
      .done(function (data) {
        $('#run-result').html(data).show()
      })
      .fail(function (jxhr) {
        $('#run-result').html('<h1 class="alert alert-danger text-center">运行失败</h1><div class="well"></div>').show().find('div').text(jxhr.responseText);
      })
      .always(function (jqXHR, textStatus) {
        if (textStatus === "timeout" || jqXHR.status === 504) {
          $('#run-result').html('<h1 class="alert alert-danger text-center">超时</h1><div class="well"></div>').show().find('div').text('前端回调获取响应超时, 请耐心等待任务执行完成后在日志中查看执行结果');
        }
        $this.button('reset');
      });

    return false;
  });
})

$(function () {
  var fanxiBox = $("#oneCheck input:checkbox");
  fanxiBox.click(function () {
    if (this.checked || this.checked == 'checked') {
      fanxiBox.removeAttr("checked");
      $(this).prop("checked", true);
    }
  });
});