import $ from 'jquery';

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
  $("#total_log").tablesorter({
    theme: "bootstrap",
    // sortList:[[0]],
    // headers:{0:{sorter:false, parser: false}},
    headerTemplate: '{content} {icon}', // needed to add icon for jui theme
    widgets: ['uitheme', 'filter'],
    widgetOptions: {
      // using the default zebra striping class name, so it actually isn't included in the theme variable above
      // this is ONLY needed for bootstrap theming if you are using the filter widget, because rows are hidden
      // zebra : ["even", "odd"],
      // class names added to columns when sorted
      // reset filters button
      filter_reset: ".reset",
      filter_external: '.search',
      filter_columnFilters: false,
      // extra css class name (string or array) added to the filter element (input or select)
      filter_cssFilter: "form-control"
      // set the uitheme widget to use the bootstrap theme class names
      // this is no longer required, if theme is set
      // ,uitheme : "bootstrap"
    }
  });
})

module.exports = {
  displaydaylog: function () {
    var days = document.getElementById("day").value;
    if (days != "") {
      window.location.href = '/task/{{ userid }}/log/total/' + days;
    }
    return false;
  }
}