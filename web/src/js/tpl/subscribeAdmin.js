
const repoNode = {
  selectedRepoNodesJSON: '{}',

  get selectedRepoNodes() {
    return this.getSelectedRepoNodes()
  },

  set selectedRepoNodes(val) {
    this.setSelectedRepoNodes(val)
  },

  getSelectedRepoNodes: function () {
    if (this.selectedRepoNodesJSON == '{}') {
      if (typeof (sessionStorage.selectedrepo) != "undefined") {
        this.selectedRepoNodesJSON = sessionStorage.selectedrepo
      }
    }
    return JSON.parse(this.selectedRepoNodesJSON)
  },

  setSelectedRepoNodes: function (val) {
    this.selectedRepoNodesJSON = JSON.stringify(val)
    sessionStorage.selectedrepo = JSON.stringify(val)
  },

  toggle: function (repoNode, uncheck) {
    let _selectedRepoNodes = this.selectedRepoNodes
    _selectedRepoNodes[repoNode.name] = repoNode.checked
    this.selectedRepoNodes = _selectedRepoNodes
    if (!uncheck) {
      (typeof setRepoGroupChecked == 'function') && setRepoGroupChecked(repoNode.className)
    }
  },


  init: function () {
    let _selectedRepoNodes = this.selectedRepoNodes
    let _classNames = {}
    for (let key in _selectedRepoNodes) {
      let reponodes = document.getElementsByName(key);
      if (reponodes.length > 0) {
        reponodes[0].checked = _selectedRepoNodes[key]
        // 将已选中的reponode的className 存储在_classNames中
        if (_selectedRepoNodes[key]) {
          _classNames[reponodes[0].className] = true
        }
      }
    }

    for (let key in _classNames) {
      (typeof setRepoGroupChecked == 'function') && setRepoGroupChecked(key)
    }
  }

}

/**
 *  修改全选按钮样式
 *  在repoNode.init()之前加载
 *
 **/
function setRepoGroupChecked(className) {
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
  const _repoNodes = document.getElementsByClassName(className)

  for (key in _repoNodes) {
    if (_repoNodes[key].checked == true) {
      _checkedNum++
    }
  }

  if (_checkedNum == _repoNodes.length) {
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
repoNode.init()