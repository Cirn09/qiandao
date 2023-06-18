import $ from 'jquery';

$(function () {
  // run test
  $('#sendpushsw').on('click', function () {
    var env = {};
    for (var _env = $('form').serializeArray(), i = _env.length - 1; i >= 0; i--) {
      env[_env[i].name] = _env[i].value;
    }
    var data = {
      env: JSON.stringify(env)
    }

    var $this = $(this);
    $this.button('loading');
    $.ajax("/user/{{ userid }}/pushsw", {
      type: 'POST',
      data: data,
    })
      .done(function (data) {
        $('#run-result').html(data).show()
      })
      .fail(function (jxhr) {
        $('#run-result').html('<h1 class="alert alert-danger text-center">运行失败</h1><div class="well"></div>').show().find('div').text(jxhr.responseText);
      })
      .always(function (jxhr, textStatus) {
        if (textStatus == 'timeout' || jxhr.status == 504) {
          $('#run-result').html('<h1 class="alert alert-danger text-center">超时</h1><div class="well"></div>').show().find('div').text('前端回调获取响应超时, 请耐心等待或刷新页面后查看执行结果');
        }
        $this.button('reset');
      });

    return false;
  });
})
