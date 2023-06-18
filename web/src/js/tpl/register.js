import $ from 'jquery';


$(function () {
  $('#register').on('click', function () {
    data = {
      reponame: $('#reponame')[0].value,
      repourl: $('#repourl')[0].value,
      repobranch: $('#repobranch')[0].value,
      repoacc: ($('#repoacc')[0].checked) ? true : false
    }
    var $this = $(this);
    $this.button('loading');
    $.ajax("/subscribe/signup_repos/{{userid}}/", {
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
      });

    return false;
  });
  $('#modal_load').on('hide.bs.modal',
    function () {
      location.reload();
    })
});