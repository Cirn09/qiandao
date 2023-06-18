import $ from 'jquery';

$(function () {
  $('#unsubscribe').on('click', function () {
    NProgress.start();
    data = {
      selectedrepos: JSON.stringify(selectedrepos)
    }
    var $this = $(this);
    $this.button('loading');
    NProgress.inc();
    $.ajax("/subscribe/unsubscribe_repos/{{user.id}}/", {
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
        NProgress.inc();
        if (typeof (sessionStorage.selectedrepo) != "undefined") {
          sessionStorage.removeItem('selectedrepo')
        }
      });
    NProgress.done();
    return false;
  });
  $('#modal_load').on('hide.bs.modal',
    function () {
      location.reload();
    })
});