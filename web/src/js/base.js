// resoruces
import '/src/img/icon.png'
import '/src/img/16.png'
import '/src/img/32.png'
import '/src/img/96.png'
import '/src/img/120.png'
import '/src/img/128.png'
import '/src/img/152.png'
import '/src/img/167.png'
import '/src/img/192.png'
import '/src/img/180.png'

// css
// *import by less

// less
import '/src/less/base.less'

// js
// import 'jquery/dist/jquery.min.js'
// import 'select2/dist/js/select2.full.min.js'
// import 'bootstrap/dist/js/bootstrap.min.js'
// import 'nprogress/nprogress.js'
// import 'tablesorter/dist/js/jquery.tablesorter.min.js'
// import 'tablesorter/dist/js/jquery.tablesorter.widgets.min.js'
// import 'blueimp-md5/js/md5.min.js'
// import 'clipboard/dist/clipboard.min.js'
// import 'lunar-javascript/lunar.js'

import $ from 'jquery'
import 'select2'
import 'bootstrap'
import 'nprogress'
import 'tablesorter'
import 'blueimp-md5'
import ClipboardJS from 'clipboard'
// import 'clipboard/dist/clipboard.min.js'
import { Solar, HolidayUtil } from 'lunar-javascript'
// const Solar = require('lunar-javascript').Solar
import 'js-base64';



// script
// var clipboard = new ClipboardJS('.hljs-button');
// var cur;
// clipboard.on('success', function (e) {
//   //onsole.info('Action:', e.action);
//   //onsole.info('Text:', e.text);
//   //console.info('Trigger:', e.trigger);
//   e.clearSelection();
//   cur = e.trigger;
//   cur.innerHTML = "复制成功";
//   setTimeout(function () {
//     cur.innerHTML = "复制";
//   }, 1000);
// });
// clipboard.on('error', function (e) {

//   console.error('Action:', e.action);
//   console.error('Trigger:', e.trigger);
// });



function get_holiday_or_version(version) {
  if (version === '' || version === undefined || version === null) {
    return version
  }
  var d = Solar.fromDate(new Date())
  var holiday = HolidayUtil.getHoliday(d.toYmd())
  if (holiday) {
    if (holiday.isWork()) {
      return version
    }
    return holiday.getName() + '快乐'
  } else {
    return version
  }
}

export { ClipboardJS, get_holiday_or_version, $ };