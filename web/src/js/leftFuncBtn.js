import $ from 'jquery';

// 向上滚动的函数
$(function () {
  $('#BackTop').click(function () {
    $('html,body').animate({ scrollTop: 0 }, 500);
  });
});
Back2tpl.onclick = function () {
  $('html,body').animate({ scrollTop: $("#tplsection").offset().top }, { duration: 500, easing: "swing" });
}

newtplbtn.onclick = function () {
  window.open('/har/edit', '_blank',);
}