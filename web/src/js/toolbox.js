// less
import '/src/less/my.less'

import $ from 'jquery'
// script

export function send2notepad(mode) {
  if ($('#notepad_list')[0].value == '') {
    $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text("记事本编号不能为空");
    return;
  }
  if ($('#email')[0].value == '') {
    $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text("邮箱不能为空");
    return;
  }
  if ($('#pwd')[0].value == '') {
    $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text("密码不能为空");
    return;
  }
  data = {}
  data['f'] = mode
  data['email'] = $('#email')[0].value;
  data['pwd'] = md5($('#pwd')[0].value);
  data['data'] = $('#New_notepad_content')[0].value;
  data['id_notepad'] = $('#notepad_list')[0].value;
  $.ajax("/util/toolbox/{{ userid }}/notepad", {
    type: 'POST',
    data: data,
  })
    .done(function (jxhr) {
      window.location.assign('/util/toolbox/{{userid}}/notepad/' + $('#notepad_list')[0].value);
    })
    .fail(function (jxhr) {
      $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text(jxhr.responseText);
    })
}
export function notepadlist(mode) {
  if ($('#notepad_list')[0].value == '') {
    $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text("记事本编号不能为空");
    return;
  }
  if ($('#email')[0].value == '') {
    $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text("邮箱不能为空");
    return;
  }
  if ($('#pwd')[0].value == '') {
    $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text("密码不能为空");
    return;
  }
  data = {}
  data['f'] = mode
  data['email'] = $('#email')[0].value;
  data['pwd'] = md5($('#pwd')[0].value);
  data['id_notepad'] = $('#notepad_list')[0].value;
  $.ajax("/util/toolbox/{{ userid }}/notepad/list", {
    type: 'POST',
    data: data,
  })
    .done(function (jxhr) {
      if (data['id_notepad'] && data['f'] != 'delete') {
        window.location.assign('/util/toolbox/{{userid}}/notepad/' + data['id_notepad']);
      } else {
        window.location.assign('/util/toolbox/{{userid}}/notepad/0');
      }
    })
    .fail(function (jxhr) {
      $('#run-result').html('<h1 class="alert alert-danger text-center">设置失败</h1><div class="well"></div>').show().find('div').text(jxhr.responseText);
    })
}