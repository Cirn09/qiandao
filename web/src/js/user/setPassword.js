import $ from 'jquery';

$('#setnewpwdbtn').on('click', function() {
  data = {}
  NewPWD = $('#newpwd')[0].value;
  reNewPWD = $('#renewpwd')[0].value;
  if (NewPWD == reNewPWD){
    if (NewPWD.length >= 6){
      data['adminmail'] = $('#adminmail')[0].value;
      data['adminpwd'] = md5($('#adminpwd')[0].value);
      data['newpwd'] = NewPWD;
      data['usermail'] = "{{usermail}}";
    } else {
      $('#run-result').html("<h1 class=\"alert alert-danger text-center\">设置失败</h1><div><pre>密码少于6位</pre></div>").show();
      return
    }
  } else {
    $('#run-result').html("<h1 class=\"alert alert-danger text-center\">设置失败</h1><div><pre>密码不一致</pre></div>").show();
    return
  }

  $.ajax("/user/{{ userid }}/setnewpwd",
         {type: 'POST',
          data: data,})
    .done(function(data) {
      $('#run-result').html(data).show();})
  return false;
});