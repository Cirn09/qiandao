import $ from 'jquery';

$(function () {
  var fanxiBox = $("#oneCheck input:checkbox");
  fanxiBox.click(function () {
     if(this.checked || this.checked=='checked'){

         fanxiBox.removeAttr("checked");
         $(this).prop("checked", true);
       }
  });
});