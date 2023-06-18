import $ from 'jquery';

$(function () {
  // run test
  $('#test, #register').on('click', function () {
    var env = {};
    for (var _env = $('form').serializeArray(), i = _env.length - 1; i >= 0; i--) {
      env[_env[i].name] = _env[i].value;
    }
    var data = {}
    if (this.name == "regbtn") {
      data = {
        env: JSON.stringify(env),
        func: "reg",
      }
    } else {
      data = {
        env: JSON.stringify(env),
        func: "test",
      }
    }

    var $this = $(this);
    $this.button('loading');
    $.ajax("/user/{{ userid }}/regpush", {
      type: 'POST',
      data: data,
    })
      .done(function (data) {
        $('#run-result').html(data).show()

      })
      .fail(function (jxhr) {
        $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text(jxhr.responseText);
      })
      .always(function () {
        $this.button('reset');
        $this.css("outline", "none");
      });

    return false;
  });
})

$(function () {
  // run test
  $('#showpvar').on('click', function () {
    data = {}
    data['adminmail'] = $('#adminmail')[0].value;
    data['adminpwd'] = md5($('#adminpwd')[0].value);
    $this = $(this);
    $.ajax("/user/{{ userid }}/UserPushShowPvar", {
      type: 'POST',
      data: data,
    })
      .done(function (data) {
        $('#run-result').html(data).show()
      })
      .fail(function (jxhr) {
        $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text(jxhr.responseText);
      })
      .always(function () {
        $this.button('reset');
        $this.css("outline", "none");
      });
    return false
  });
})