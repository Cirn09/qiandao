
// less
import '/src/less/editor.less'

import $ from 'jquery'

// script
var currentDragItem = null;
var StartY = 0;
var startIndex = 0;
var offsetY = 0;
var maxIndex = 0;

export function reserve_check() {
  document.querySelectorAll('#droplist>a.list-group-item.entry').forEach(function (el) {
    var tmp = el.getElementsByClassName('entry-checked')[0].getElementsByTagName('input')[0]
    tmp.checked = !tmp.checked
  });
  entries = window.global_har.har.log.entries
  for (i = 0; i < entries.length; i++) {
    entries[i].checked = !entries[i].checked
  }
};
export function sortRequest(checkbox) {
  var RequestIndex = 1;
  document.querySelectorAll('#droplist>a.list-group-item.entry').forEach(function (el) {
    var tmp = el.getElementsByClassName('entry-checked')[0]
    if (tmp.getElementsByTagName('input')[0].checked) {
      if (checkbox.checked) {
        tmp.childNodes[2].data = RequestIndex.toString();
        RequestIndex += 1;
      }
      else {
        tmp.childNodes[2].data = ""
      }
    }
    else {
      tmp.childNodes[2].data = ""
    }
  });
}
export function resortEntryList() {
  DragIndex = 0;
  document.querySelectorAll('#droplist>a.list-group-item.entry').forEach(function (el) {
    el.setAttribute('dragid', DragIndex);
    DragIndex += 1;
  });
  maxIndex = DragIndex;
}
export function dragstartFunc(ev) {
  resortEntryList();
  StartY = parseInt(ev.clientY);
  startIndex = parseInt(ev.srcElement.getAttribute('dragid'));
  currentDragItem = ev.srcElement;
  offsetY = ev.offsetY;
}

export function dragendFunc(ev) {
  var C_height = parseInt(ev.srcElement.clientHeight);
  var EndY = parseInt(ev.clientY)
  var EndIndex = 0;
  if (EndY > StartY) {
    EndIndex = (parseInt(startIndex + ((EndY - StartY) / C_height)));
  }
  else {
    EndIndex = (parseInt(startIndex + ((EndY - StartY) / C_height) + 1));
  }
  var tmp = window.global_har.har.log.entries[startIndex];
  if (EndIndex > startIndex) {
    window.global_har.har.log.entries.splice(EndIndex + 1, 0, tmp);
    window.global_har.har.log.entries.splice(startIndex, 1);
  }
  else {
    window.global_har.har.log.entries.splice(EndIndex, 0, tmp);
    window.global_har.har.log.entries.splice(startIndex + 1, 1);
  }


  resortEntryList();
  sortRequest($('#sortBtn')[0]);
  currentDragItem = null;
}

export function droplistFunc(ev) {
  ev.preventDefault();
  if (!currentDragItem) { return }
  var dragitem = ev.target.closest('.list-group-item.entry');
  if (dragitem) {
    if (ev.offsetY > offsetY) {
      tmp = ev.srcElement.getAttribute('dragid')
      if (tmp) {
        dragitem.after(currentDragItem);
      }
    } else {
      dragitem.before(currentDragItem);
    }
  }
}

$(function () {
  $('#Delete_seleted_Btn').on('click', function () {
    var RequestIndex = 0;
    var Indexs = new Array();
    var es = document.querySelectorAll('#droplist>a.list-group-item.entry');
    window.global_har.har.log.entries.forEach(function (entry) {
      if (entry.checked) {
        es[RequestIndex].parentNode.removeChild(es[RequestIndex]);
        Indexs.splice(0, 0, entry);
      }
      RequestIndex += 1;
    });
    Indexs.forEach(function (entry) {
      window.global_har.har.log.entries.splice(window.global_har.har.log.entries.indexOf(entry), 1)
    });
  });
})