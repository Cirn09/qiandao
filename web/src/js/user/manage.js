import $ from 'jquery';

$(function () {
  $('#ban,#activate,#verify,#del').on('click', function () {
    var env = {};
    chkflg = false;
    tmp = document.querySelectorAll('.userlist-chkbox').forEach(function (el) {
      if (el.checked) {
        env[el.name] = 'on'
        chkflg = true;
      }
    });
    if (!chkflg) {
      $('#run-result').html("<h1 class=\"alert alert-danger text-center\">错误</h1><div><pre>请至少选择一个成员</pre></div>").show();
      return false;
    }
    env["adminpwd"] = md5($('#adminpwd')[0].value);
    env["adminmail"] = $('#adminmail')[0].value;
    env[this.name] = ''

    var $this = $(this);
    $this.button('loading');
    $.ajax("/user/{{ userid }}/manage", {
      type: 'POST',
      data: env,
    })
      .done(function (response, status, xhr) {
        if (response.indexOf('alert alert-success text-center') > -1) {
          refresh_modal_load("/user/{{ userid }}/manage?flg=success&title=操作成功")
        } else {
          $('#run-result').html(response).show()
        }
      })
      .always(function () {
        $this.button('reset');
      });

    return false;
  });
})

$(function () {
  // Extend the themes to change any of the default class names
  $.tablesorter.themes.bootstrap = {
    // these classes are added to the table. To see other table classes available,
    // look here: http://getbootstrap.com/css/#tables
    table: 'table table-hover',
    caption: 'caption',
    // header class names
    header: 'bootstrap-header', // give the header a gradient background (theme.bootstrap_2.css)
    sortNone: '',
    sortAsc: '',
    sortDesc: '',
    active: '', // applied when column is sorted
    hover: '', // custom css required - a defined bootstrap style may not override other classes
    // icon class names
    icons: '', // add "bootstrap-icon-white" to make them white; this icon class is added to the <i> in the header
    iconSortNone: 'bootstrap-icon-unsorted', // class name added to icon when column is not sorted
    iconSortAsc: 'glyphicon glyphicon-chevron-up', // class name added to icon when column has ascending sort
    iconSortDesc: 'glyphicon glyphicon-chevron-down', // class name added to icon when column has descending sort
    filterRow: '', // filter row class; use widgetOptions.filter_cssFilter for the input/select element
    footerRow: '',
    footerCells: '',
    even: '', // even row zebra striping
    odd: ''  // odd row zebra striping
  };
  $("#user_table").tablesorter({
    theme: "bootstrap",
    sortList: [[3, 1]],
    headers: {
      0: { sorter: false, parser: false },
      5: { sorter: false, parser: false }
    },
    headerTemplate: '{content} {icon}', // needed to add icon for jui theme
    widgets: ['uitheme']
  });

})