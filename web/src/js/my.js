// less
import '/src/less/my.less'

import $ from 'jquery'

// script
module.exports = {
  refresh_modal_load: function (url) {
    // <a data-load-method="GET" class="modal_load" href="/user/{{ userid }}/manage" title="管理用户">管理用户</a>
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.setAttribute('data-load-method', 'GET');
    a.setAttribute('class', 'modal_load');
    a.setAttribute('href', url);
    a.click();
    document.body.removeChild(a);
  },
  checkboxOnclick: function (checkbox) {
    var tasknodes = document.getElementsByClassName(checkbox.name);
    for (i = 0; i < tasknodes.length; i++) {
      if (checkbox.checked == true) {
        $(tasknodes[i]).hide();
      } else {
        $(tasknodes[i]).show();
      }
    }
  },
  del_confirm: function () {
    $('#multi_op-result').html('<div class="alert alert-info" role="alert">\
          您正在删除多个任务，是否继续？\
          <a href="javascript:void(0);" onclick="Del_tasks()"> 继续 </a> /\
          <a href="javascript:void(0);" onclick="goto_my()">取消</a> \
        </div>').show();
  },

  Null_info: function () {
    $('#multi_op-result').html('<div class="alert alert-info" role="alert">\
            请选择任务！\
            <a href="javascript:void(0);" onclick="goto_my()"> 返回 </a> \
          </div>').show();
  },

  Get_Groups: function () {
    var str1 = '<div class="alert alert-info" role="alert">\
    您正在设置多个任务的分组，是否继续？\
    <a href="javascript:void(0);" onclick="setTasksGroup()"> 继续 </a> /\
    <a href="javascript:void(0);" onclick="goto_my()">取消</a> \
    </div>\
      <div class="use_redpackets_content" id="oneCheck"><label class="control-label" for="note">选择分组</label>'
    var str2 = '<div class="checkbox"><label><input type="checkbox" name="'
    var str3 = '</label></div>'
    var str4 = '</div>\
    <div class="form-group">\
      <label class="control-label" for="note">新分组</label>\
      <input type="text" class="form-control" name="NewGroupValue" value="" id="NewGroupValue" placeholder="None">\
    </div>\
    '
    var Indexs = {};
    var es = document.querySelectorAll('tr[class*=taskgroup]');
    var tmp = ""
    es.forEach(function (entry) {
      var tmp = entry.getElementsByTagName('td')[0].getElementsByTagName('input')[0]
      if (tmp.checked) {
        Indexs[tmp.name] = ''
      }
    });
    if (Object.keys(Indexs).length > 0) {
      var groupurl = '/getgroups/' + Object.keys(Indexs)[0]
      $.get(groupurl, function (result) {
        tmp = JSON.parse(result)
        var groupinfo = ""
        Object.keys(tmp).forEach(function (key) {
          groupinfo = groupinfo + str2 + key + '">' + key + str3;
        });
        $("#multi_op-result").html(str1 + groupinfo + str4).show();
        OnlyCheckOne()
      });
    }
    else {
      Null_info()
    }
    return false;
  },

  goto_my: function () {
    window.location.replace("/my/")
  },

  OnlyCheckOne: function () {
    var fanxiBox = $("#oneCheck input:checkbox");
    fanxiBox.click(function () {
      if (this.checked || this.checked == 'checked') {
        fanxiBox.removeAttr("checked");
        $(this).prop("checked", true);
      }
    });
  },

  Del_tasks: function () {
    var Indexs = {};
    var es = document.querySelectorAll('tr[class*=taskgroup]');
    es.forEach(function (entry) {
      var tmp = entry.getElementsByTagName('td')[0].getElementsByTagName('input')[0]
      if (tmp.checked) {
        Indexs[tmp.name] = ''
      }
    });
    var $this = $(this);
    var data = { taskids: JSON.stringify(Indexs), func: "Del" }
    $.ajax('/tasks/{{ userid }}', {
      type: 'POST',
      data: data,
    })
      .done(function (data) {
        goto_my()
      })
      .fail(function (jxhr) {
        $("del_confirm-result").html('<h1 class="alert alert-danger text-center">失败</h1><div class="well"></div>').show().find('div').text(jxhr.responseText);
      })
      .always(function () {
        $this.button('reset');
      });

    return false;
  },

  setTasksGroup: function () {
    var Indexs = {};
    var es = document.querySelectorAll('tr[class*=taskgroup]');
    var tmp = ""
    var groupValue = ''
    es.forEach(function (entry) {
      var tmp = entry.getElementsByTagName('td')[0].getElementsByTagName('input')[0]
      if (tmp.checked) {
        Indexs[tmp.name] = ''
      }
    });

    tmp = document.querySelectorAll('#NewGroupValue')[0]
    if (tmp.value == '') {
      es = document.querySelectorAll('#oneCheck input[type=checkbox]');
      es.forEach(function (e) {
        if (e.checked) {
          groupValue = e.name;
        }
      });
    }
    else {
      groupValue = tmp.value
    }
    var $this = $(this);
    var data = { taskids: JSON.stringify(Indexs), func: "setGroup", groupValue: groupValue }
    $.ajax('/tasks/{{ userid }}', {
      type: 'POST',
      data: data,
    })
      .done(function (data) {
        window.location.replace("/my/")
      })
      .fail(function (jxhr) {
        $('#run-result').html('<h1 class="alert alert-danger text-center">失败</h1><div class="well"></div>').show().find('div').text(jxhr.responseText);
      })
      .always(function () {
        $this.button('reset');
      });

    return false;
  },

  /**
   * 全选/反选
   *
   **/
  allTaskgroupChecked: function (checkbox) {
    var tmp = checkbox.name
    var tasknodes = document.querySelectorAll('input[class="' + tmp + '"]');
    if (tasknodes.length > 0) {
      for (i = 0; i < tasknodes.length; i++) {
        if (checkbox.checked) {
          tasknodes[i].checked = true
        }
        else {
          tasknodes[i].checked = false
        }
        taskNode.toggle(tasknodes[i], true)
      }
    }
  }
}


const taskNode = {
  selectedTaskNodesJSON: '{}',

  get selectedTaskNodes() {
    return this.getSelectedTaskNodes()
  },

  set selectedTaskNodes(val) {
    this.setSelectedTaskNodes(val)
  },

  getSelectedTaskNodes: function () {
    if (this.selectedTaskNodesJSON == '{}') {
      if (typeof (sessionStorage.selectedtask) != "undefined") {
        this.selectedTaskNodesJSON = sessionStorage.selectedtask
      }
    }
    return JSON.parse(this.selectedTaskNodesJSON)
  },

  setSelectedTaskNodes: function (val) {
    this.selectedTaskNodesJSON = JSON.stringify(val)
    sessionStorage.selectedtask = JSON.stringify(val)
  },

  toggle: function (taskNode, uncheck) {
    let _selectedTaskNodes = this.selectedTaskNodes
    _selectedTaskNodes[taskNode.name] = taskNode.checked
    this.selectedTaskNodes = _selectedTaskNodes
    if (!uncheck) {
      (typeof setTaskGroupChecked == 'function') && setTaskGroupChecked(taskNode.className)
    }
  },


  init: function () {
    let _selectedTaskNodes = this.selectedTaskNodes
    let _classNames = {}
    for (let key in _selectedTaskNodes) {
      let tasknodes = document.getElementsByName(key);
      if (tasknodes.length > 0) {
        tasknodes[0].checked = _selectedTaskNodes[key]
        // 将已选中的tasknode的className 存储在_classNames中
        if (_selectedTaskNodes[key]) {
          _classNames[tasknodes[0].className] = true
        }
      }
    }

    for (let key in _classNames) {
      (typeof setTaskGroupChecked == 'function') && setTaskGroupChecked(key)
    }
  }

}

/**
 *  修改全选按钮样式
 *  在taskNode.init()之前加载
 *
 **/
function setTaskGroupChecked(className) {
  let _eles = document.getElementsByName(className)
  let _nodeGroupChecked
  for (let i = 0; i < _eles.length; i++) {
    if (_eles[i].nodeName.toLowerCase() == 'input' &&
      _eles[i].getAttribute('type') == 'checkbox'
    ) {
      _nodeGroupChecked = _eles[i]
    }
  }
  if (typeof _nodeGroupChecked == 'undefined') return;
  let _checkedNum = 0
  const _taskNodes = document.getElementsByClassName(className)

  for (key in _taskNodes) {
    if (_taskNodes[key].checked == true) {
      _checkedNum++
    }
  }

  if (_checkedNum == _taskNodes.length) {
    _nodeGroupChecked.indeterminate = false;
    _nodeGroupChecked.checked = true;
  } else if (_checkedNum > 0) {
    _nodeGroupChecked.indeterminate = true;
    _nodeGroupChecked.checked = false;
  } else {
    _nodeGroupChecked.indeterminate = false;
    _nodeGroupChecked.checked = false;
  }
}

// 页面加载后初始化
taskNode.init()


/**
 * 创建一个用于控制group隐藏显示的对象
 *
 * storage_HiddenGroupsName: 存储在localStorage中的隐藏Groups变量的名
 **/
function createGroupObj(storage_HiddenGroupsName) {
  if (typeof storage_HiddenGroupsName != 'string' && storage_HiddenGroupsName.strim() != storage_HiddenGroupsName) {
    throw new Error('参数storageHiddenGroupsName类型必须为string，且不能为空')
  }

  return {
    hiddenGroupsJSON: '{}',
    _localStorageName: storage_HiddenGroupsName,
    get hiddenGroups() {
      return this.getHiddenGroups()
    },

    set hiddenGroups(val) {
      this.setHiddenGroups(val)
    },

    getHiddenGroups: function () {
      if (this.hiddenGroupsJSON == '{}') {
        if (typeof (window.localStorage[this._localStorageName]) != "undefined") {
          this.hiddenGroupsJSON = window.localStorage[this._localStorageName];
        }
      }
      return JSON.parse(this.hiddenGroupsJSON)
    },

    setHiddenGroups: function (val) {
      this.hiddenGroupsJSON = JSON.stringify(val)
      window.localStorage[this._localStorageName] = JSON.stringify(val)
    },

    toggle: function (that) {
      let groupName = that.name
      let _hiddenGroups = this.hiddenGroups
      if (typeof _hiddenGroups[groupName] != 'boolean') {
        _hiddenGroups[groupName] = false
      }
      _hiddenGroups[groupName] = !_hiddenGroups[groupName]
      this.nodesDisplay(groupName, !_hiddenGroups[groupName])
      this.hiddenGroups = _hiddenGroups
      // 三角符号变动
      if (that.className.includes('dropup')) {
        that.className = that.className.replaceAll('dropup', '')
      } else {
        that.className = that.className.replace(/^\s+|\s+$/gm, '') + ' dropup'
      }
    },

    nodesDisplay: function (groupName, bool) {
      // bool: true时显示，false时隐藏
      let tasknodes = document.getElementsByClassName(groupName);
      if (tasknodes.length > 0) {
        for (i = 0; i < tasknodes.length; i++) {
          $(tasknodes[i]).toggle(bool);
        }
      }

    },

    init: function () {
      let _hiddenGroups = this.hiddenGroups
      for (let key in _hiddenGroups) {
        this.nodesDisplay(key, !_hiddenGroups[key])
        if (_hiddenGroups[key]) {
          // $('input[type="checkbox"][name="'+key+'"]').prop('checked', _hiddenGroups[key])
          let _hiddenButton = document.getElementsByName(key)[0]
          if (_hiddenButton == undefined) continue;
          _hiddenButton.className = _hiddenButton.className.replaceAll('dropup', '')
        }
      }

    }
  }
}
const taskGroup = createGroupObj('HiddenTaskGroups')
// 页面加载后初始化
taskGroup.init()


const tplGroup = createGroupObj('HiddenTplGroups')
tplGroup.init()
// const tplGroup = new taskGroup()


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
  $("#task_list,#tpl_list").tablesorter({
    theme: "bootstrap",
    // sortList:[[4,1],[2,0]],
    headers: {
      0: { sorter: false },
      1: { sorter: false },
      2: { sorter: false },
      3: { sorter: false },
      4: { sorter: false },
      5: { sorter: false, parser: false },
    },
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

$(function () {
  $('[data-toggle=popover]').popover({
    trigger: 'hover'
  });
})