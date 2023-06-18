
// less
import '/src/less/my.less'

import $ from 'jquery';

$('#pusher_method').change(function () {
  if (this.value == 'GET') {
    document.getElementById('pusher_get_content').style.display = 'block';
    document.getElementById('pusher_post_content').style.display = 'none';
  } else if (this.value == 'POST') {
    document.getElementById('pusher_get_content').style.display = 'none';
    document.getElementById('pusher_post_content').style.display = 'block';
  } else {
    document.getElementById('pusher_get_content').style.display = 'none';
    document.getElementById('pusher_post_content').style.display = 'none';
  }

  return false;
});

$('#test, #register').on('click', function () {
  data = {}
  mode = $('#pusher_method')[0].value;
  data['mode'] = mode;
  data['btn'] = this.name;
  if (mode == 'GET') {
    data['curl'] = $('#pusher_get_url')[0].value;
    data['headers'] = $('#pusher_get_header')[0].value;
  } else if (mode == 'POST') {
    data['curl'] = $('#pusher_post_url')[0].value;
    data['headers'] = $('#pusher_post_header')[0].value;
    data['postMethod'] = $('#pusher_post_data_method')[0].value;
    data['postData'] = $('#pusher_post_data')[0].value;
  } else {
    alert('请选择请求模式')
    return false
  }

  $.ajax("/util/custom/{{ userid }}/pusher", {
    type: 'POST',
    data: data,
  })
    .done(function (data) {
      $('#run-result').html(data).show()
    })
    .fail(function (data) {
      $('#run-result').html(data).show()
    })
  return false;
});