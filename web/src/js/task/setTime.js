import $ from 'jquery';

$('#ontime_method').change(function() {
  if (this.value == 'ontime') {
    document.getElementById('ontime_content').style.display='block';
    document.getElementById('cron_content').style.display='none';
  } else if (this.value == 'cron') {
    document.getElementById('ontime_content').style.display='none';
    document.getElementById('cron_content').style.display='block';
  } else{
    document.getElementById('ontime_content').style.display='none';
    document.getElementById('cron_content').style.display='none';
    document.getElementById('randtime_content').style.display='none';
  }

  return false;
});

$('#send').on('click', function() {
  sendData = {}
  data = {}

  if ($('#randtimezonesw')[0].checked == true){
    sendData['tz1'] = parseInt($('#randtimezone1')[0].value);
    sendData['tz2'] = parseInt($('#randtimezone2')[0].value);
    if (sendData['tz1'] > sendData['tz2']){
        $('#run-result').html("<h1 class=\"alert alert-danger text-center\">随机值错误</h1><div><pre>开启随机时tz1 不能小于 tz2</pre></div>").show();
        return false;
    }
    sendData['randsw'] = true;
  }else{
    sendData['randsw'] = false;
  }

  if ($('#ontime_flg')[0].checked == true){
    sendData['mode'] = $('#ontime_method')[0].value;
    sendData['sw'] = true;
    if (sendData['mode'] == 'ontime'){
      sendData['date'] = $('#ontime_run_date')[0].value;
      sendData['time'] = $('#ontime_val')[0].value;
    } else if (sendData['mode'] == 'cron'){
      sendData['cron_val'] = $('#cron_val')[0].value;
      // sendData['cron_sec'] = $('#cron_sec')[0].value;
    } else{
      $('#run-result').html("<h1 class=\"alert alert-danger text-center\">模式错误</h1><div><pre>模式错误</pre></div>").show();
      return false;
    }
  } else {
    sendData['sw'] = false;
  }

  var $this = $(this);
  $.ajax("/task/{{task.id}}/settime", {
        type: 'POST',
        data: sendData,
      })
      .done(function(data) {
        $('#run-result').html(data).show()
      })
      .always(function() {
      $this.button('reset');
    });
  return false;
});